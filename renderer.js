// renderer.js
const { ipcRenderer } = require('electron');

function enterWallpaperMode() {
  ipcRenderer.send('wallpaper-mode');
}
function enterInteractiveMode() {
  ipcRenderer.send('interactive-mode');
}
