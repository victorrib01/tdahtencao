const { app, BrowserWindow, Tray, Menu } = require('electron');
let win;
function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: true } });
  win.loadFile('index.html');
}
app.whenReady().then(createWindow);

// Tray example
let tray = null;
app.whenReady().then(() => {
  tray = new Tray('icon.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Cronograma', click: () => win.show() },
    { label: 'Sair', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);
});
