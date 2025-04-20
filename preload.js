const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wallpaperAPI', {
  toggle: () => ipcRenderer.invoke('toggle-wallpaper'),
  onState: cb => ipcRenderer.on('wallpaper-state', (_e, state) => cb(state))
});
