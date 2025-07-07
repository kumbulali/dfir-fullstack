import React, { useState, useEffect } from "react";
import axios from "axios";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen, { Job } from "./screens/HomeScreen";

declare global {
  interface Window {
    electronAPI: {
      getOs: () => Promise<string>;
      getIp: () => Promise<string>;
      mqttConnect: (credentials: any) => void;
      mqttDisconnect: () => void;
      onMqttStatusUpdate: (
        callback: (status: string, error?: string) => void
      ) => () => void;
      onJobNew: (callback: (job: Job) => void) => () => void;
      onJobUpdate: (
        callback: (update: {
          jobId: number;
          status: "completed" | "failed";
          error?: string;
        }) => void
      ) => () => void;
      onForceLogout: (callback: () => void) => () => void;
    };
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<"register" | "home">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mqttStatus, setMqttStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error" | "reconnecting"
  >("disconnected");
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleLogout = () => {
    console.log("[Renderer] Logging out...");
    window.electronAPI.mqttDisconnect();
    localStorage.clear();
    setView("register");
    setError(null);
    setJobs([]);
  };

  useEffect(() => {
    const unsubStatus = window.electronAPI.onMqttStatusUpdate((status, err) => {
      console.log(
        `[Renderer] Received MQTT status update: ${status}`,
        err || ""
      );
      setMqttStatus(status as any);
      if (err) setError(`MQTT Error: ${err}`);
    });

    const unsubJobNew = window.electronAPI.onJobNew((job) => {
      console.log("[Renderer] Received new job:", job);
      setJobs((prevJobs) => {
        const jobExists = prevJobs.some((j) => j.jobId === job.jobId);
        return jobExists ? prevJobs : [...prevJobs, job];
      });
    });

    const unsubJobUpdate = window.electronAPI.onJobUpdate((update) => {
      console.log("[Renderer] Received job update:", update);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobId === update.jobId
            ? { ...job, status: update.status, error: update.error }
            : job
        )
      );
    });

    const unsubForceLogout = window.electronAPI.onForceLogout(() => {
      console.log(
        "[Renderer] Received force-logout command from main process."
      );
      handleLogout();
    });

    return () => {
      unsubStatus();
      unsubJobNew();
      unsubJobUpdate();
      unsubForceLogout();
    };
  }, []);

  useEffect(() => {
    const credentials = {
      accessToken: localStorage.getItem("accessToken"),
      username: localStorage.getItem("username"),
      password: localStorage.getItem("password"),
      tenantId: localStorage.getItem("tenantId"),
      responderId: localStorage.getItem("responderId"),
    };

    if (
      credentials.accessToken &&
      credentials.username &&
      credentials.password &&
      credentials.tenantId &&
      credentials.responderId
    ) {
      console.log(
        "[Renderer] Found existing credentials, requesting MQTT connection..."
      );
      setView("home");
      window.electronAPI.mqttConnect(credentials);
    }
  }, []);

  const handleRegister = async (tenantId: string, enrollmentToken: string) => {
    setError(null);
    setLoading(true);

    const responderUri = "http://localhost:3001/responders/register";

    try {
      const os = await window.electronAPI.getOs();
      const response = await axios.post(
        responderUri,
        { operatingSystem: os, enrollmentToken },
        { headers: { "x-tenant-id": tenantId } }
      );

      const { accessToken, username, password, id } = response.data;
      if (!accessToken || !username || !password || !id) {
        throw new Error("Incomplete information received from server.");
      }

      const credentials = {
        accessToken,
        username,
        password,
        responderId: id,
        tenantId,
      };
      localStorage.setItem("accessToken", credentials.accessToken);
      localStorage.setItem("username", credentials.username);
      localStorage.setItem("password", credentials.password);
      localStorage.setItem("responderId", credentials.responderId);
      localStorage.setItem("tenantId", credentials.tenantId);

      setView("home");
      window.electronAPI.mqttConnect(credentials);
    } catch (err: any) {
      console.error("[Renderer] Registration error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {view === "register" && (
        <RegisterScreen
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />
      )}
      {view === "home" && (
        <HomeScreen
          jobs={jobs}
          mqttStatus={mqttStatus}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
