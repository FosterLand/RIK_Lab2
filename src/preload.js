const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveResultFile: (resultText) => ipcRenderer.invoke('save-result-file', resultText)
});
