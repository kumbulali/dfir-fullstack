import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getOs: (): Promise<string> => ipcRenderer.invoke("get-os"),
  getIp: (): Promise<string> => ipcRenderer.invoke("get-ip"),

  mqttConnect: (credentials: any) =>
    ipcRenderer.send("mqtt-connect", credentials),
  mqttDisconnect: () => ipcRenderer.send("mqtt-disconnect"),
  onMqttStatusUpdate: (callback: (status: string, error?: string) => void) => {
    const sub = (event: IpcRendererEvent, status: string, error?: string) =>
      callback(status, error);
    ipcRenderer.on("mqtt-status-update", sub);
    return () => ipcRenderer.removeListener("mqtt-status-update", sub);
  },

  onJobNew: (callback: (job: any) => void) => {
    const sub = (event: IpcRendererEvent, job: any) => callback(job);
    ipcRenderer.on("job-new", sub);
    return () => ipcRenderer.removeListener("job-new", sub);
  },
  onJobUpdate: (callback: (update: any) => void) => {
    const sub = (event: IpcRendererEvent, update: any) => callback(update);
    ipcRenderer.on("job-update", sub);
    return () => ipcRenderer.removeListener("job-update", sub);
  },

  onForceLogout: (callback: () => void) => {
    const sub = () => callback();
    ipcRenderer.on("force-logout", sub);
    return () => ipcRenderer.removeListener("force-logout", sub);
  },
});
