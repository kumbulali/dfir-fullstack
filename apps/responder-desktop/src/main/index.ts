import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import mqtt from "mqtt";
import axios from "axios";
import { configureStore } from "../shared/store";

const store = configureStore();

let mainWindow: BrowserWindow | null = null;
let mqttClient: mqtt.MqttClient | null = null;
let healthCheckInterval: NodeJS.Timeout | null = null;
let currentAccessToken: string | null = null;
let currentTenantId: string | null = null;

function sendMqttStatusToRenderer(status: string, error?: string) {
  if (mainWindow) {
    mainWindow.webContents.send("mqtt-status-update", status, error);
  }
}

function connectMqtt(credentials: any) {
  if (mqttClient) {
    mqttClient.end(true);
    mqttClient = null;
  }
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  if (!credentials || !credentials.accessToken || !credentials.tenantId) {
    console.error(
      '[MQTT Main] ERROR: "accessToken" or "tenantId" not found in credentials.'
    );
    sendMqttStatusToRenderer(
      "error",
      "Access token or Tenant ID is missing for connection."
    );
    return;
  }
  currentAccessToken = credentials.accessToken;
  currentTenantId = credentials.tenantId;

  console.log(
    `[MQTT Main] Attempting to connect to mqtt://localhost:1883 with username: ${credentials.username}`
  );
  sendMqttStatusToRenderer("connecting");

  const client = mqtt.connect("mqtt://localhost:1883", {
    username: credentials.username,
    password: credentials.password,
    clientId: `air-responder-${Math.random().toString(16).slice(2, 10)}`,
    connectTimeout: 10000,
    reconnectPeriod: 5000,
  });

  mqttClient = client;

  client.on("connect", () => {
    console.log("[MQTT Main] Successfully connected to broker.");
    sendMqttStatusToRenderer("connected");

    const healthTopic = `health/${credentials.tenantId}/${credentials.responderId}`;
    const healthPayload = JSON.stringify({
      os: os.platform(),
      ip: getIpAddress(),
    });
    const publishHealth = () => {
      if (client.connected) {
        client.publish(healthTopic, healthPayload);
        console.log(`[MQTT Main] Published health check to ${healthTopic}`);
      }
    };
    publishHealth();
    healthCheckInterval = setInterval(publishHealth, 5000);

    const commandTopic = `command/request/${credentials.tenantId}/${credentials.responderId}`;
    client.subscribe(commandTopic, (err) => {
      if (!err)
        console.log(`[MQTT Main] Subscribed to command topic: ${commandTopic}`);
      else
        console.error(`[MQTT Main] Failed to subscribe to command topic:`, err);
    });
  });

  client.on("message", (topic, message) => {
    console.log(`[MQTT Main] Received message on topic: ${topic}`);
    if (topic.startsWith("command/request/")) {
      try {
        const jobData = JSON.parse(message.toString());
        console.log("[MQTT Main] Received new job:", jobData);
        processJob(jobData);
      } catch (e) {
        console.error("[MQTT Main] Failed to parse job message:", e);
      }
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT Main] Connection Error:", err.message);
    sendMqttStatusToRenderer("error", err.message);
    client.end(true);
  });

  client.on("reconnect", () => {
    console.log("[MQTT Main] Reconnecting...");
    sendMqttStatusToRenderer("reconnecting");
  });

  client.on("close", () => {
    console.log("[MQTT Main] Connection closed.");
    if (mqttClient) sendMqttStatusToRenderer("disconnected");
  });
}

async function processJob(jobData: any) {
  const { jobId, command, args } = jobData;
  if (!jobId || !command || !args) {
    console.error("[Job Processor] Invalid job data received:", jobData);
    return;
  }

  if (mainWindow) {
    mainWindow.webContents.send("job-new", {
      jobId: jobId,
      command: command,
      args: args,
      status: "pending",
    });
  }

  console.log(`[Job Processor] Waiting 5 seconds for job #${jobId}...`);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let resultValue;
  try {
    console.log(
      `[Job Processor] Executing command "${command}" for job #${jobId}`
    );
    if (command === "add") {
      resultValue = args.reduce((a: number, b: number) => a + b, 0);
    } else if (command === "subtract") {
      resultValue =
        args.length > 0
          ? args.slice(1).reduce((a: number, b: number) => a - b, args[0])
          : 0;
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
    console.log(
      `[Job Processor] Job #${jobId} calculation result: ${resultValue}`
    );
  } catch (e: any) {
    console.error(`[Job Processor] Error executing job #${jobId}:`, e.message);
    if (mainWindow)
      mainWindow.webContents.send("job-update", {
        jobId: jobId,
        status: "failed",
        error: e.message,
      });
    return;
  }

  try {
    if (!currentAccessToken || !currentTenantId) {
      throw new Error(
        "Access token or Tenant ID is not available for reporting job result."
      );
    }
    const resultApiUrl = `http://localhost:3002/jobs/${jobId}/result`;
    console.log(
      `[Job Processor] Posting result for job #${jobId} to ${resultApiUrl}`
    );

    const response = await axios.post(
      resultApiUrl,
      { result: { value: resultValue } },
      {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
          "x-tenant-id": currentTenantId,
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      console.log(
        `[Job Processor] Successfully reported result for job #${jobId}.`
      );
      if (mainWindow)
        mainWindow.webContents.send("job-update", {
          jobId: jobId,
          status: "completed",
        });
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (e: any) {
    console.error(
      `[Job Processor] Error reporting result for job #${jobId}:`,
      e.message
    );
    if (mainWindow)
      mainWindow.webContents.send("job-update", {
        jobId: jobId,
        status: "failed",
        error: e.message,
      });
  }
}

function getIpAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name];
    if (netInfo) {
      for (const net of netInfo) {
        if (net.family === "IPv4" && !net.internal) return net.address;
      }
    }
  }
  return "127.0.0.1";
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

ipcMain.handle("get-os", () => os.platform());
ipcMain.handle("get-ip", () => getIpAddress());
ipcMain.on("mqtt-connect", (event, credentials) => connectMqtt(credentials));
ipcMain.on("mqtt-disconnect", () => {
  if (mqttClient) {
    console.log("[MQTT Main] Disconnecting manually.");
    mqttClient.end(true);
    mqttClient = null;
  }
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  currentAccessToken = null;
  currentTenantId = null;
  sendMqttStatusToRenderer("disconnected");
});

ipcMain.on("dispatch-action", (event, action) => {
  console.log("Action dispatched:", action);
  store.dispatch(action);
});
