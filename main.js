const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const fs = require('fs');

let wallpaperWin;
let settingsWin;
let tray;
let clicksEnabled = false;

function createWallpaper() {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  wallpaperWin = new BrowserWindow({ x, y, width, height,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false // mantido para facilitar POC
    }
  });
  wallpaperWin.loadFile('index.html');
  wallpaperWin.setIgnoreMouseEvents(true, { forward: true });
}

function createSettings() {
  settingsWin = new BrowserWindow({
    width: 950,
    height: 500,
    title: 'Configurar Tarefas',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  settingsWin.loadFile('settings.html');
  settingsWin.on('close', e => { e.preventDefault(); settingsWin.hide(); });
}

function createTray() {
  const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <circle cx='8' cy='8' r='7' fill='#4A90E2'/></svg>`;
  const icon = nativeImage.createFromBuffer(Buffer.from(svgIcon));
  tray = new Tray(icon);
  tray.setToolTip('Todo Wallpaper');
  updateTrayMenu();
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    { label: clicksEnabled ? 'Bloquear' : 'Desbloquear', click: toggleClicks },
    { label: 'Configurar', click: () => settingsWin.show() },
    { type: 'separator' },
    { label: 'Sair', role: 'quit' }
  ]);
  tray.setContextMenu(contextMenu);
}

function toggleClicks() {
  clicksEnabled = !clicksEnabled;
  wallpaperWin.setIgnoreMouseEvents(!clicksEnabled, { forward: true });
  wallpaperWin.webContents.send('toggle-clicks', clicksEnabled);
  updateTrayMenu();
}

ipcMain.handle('save-config', (_, config) => {
  fs.writeFileSync('config.json', JSON.stringify(config));
  wallpaperWin.webContents.send('config-updated');
});

ipcMain.handle('load-config', () => {
  try { return JSON.parse(fs.readFileSync('config.json')); }
  catch { return { weekly: {}, daily: [] }; }
});

ipcMain.handle('request-clicks-state', () => clicksEnabled);

app.whenReady().then(() => {
  createWallpaper();
  createSettings();
  createTray();
});

app.on('window-all-closed', () => app.quit());