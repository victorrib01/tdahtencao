const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, Notification } = require('electron');
const fs = require('fs');

let wallpaperWin;
let settingsWin;
let tray;
let clicksEnabled = false;
let notificationTimers = [];

function loadConfig() {
  try { return JSON.parse(fs.readFileSync('config.json')); }
  catch { return { weekly: {}, daily: [], notifyOffset: 0, notificationSound: null }; }
}

function scheduleNotifications() {
  notificationTimers.forEach(t => clearTimeout(t));
  notificationTimers = [];

  const cfg = loadConfig();
  const now = new Date();
  const today = now.getDay();
  const offsetMs = (cfg.notifyOffset || 0) * 60 * 1000;

  // Weekly
  (cfg.weekly[today] || []).forEach(task => {
    const [h, m] = task.time.split(':').map(Number);
    const target = new Date(); target.setHours(h, m, 0, 0);
    const notifyTime = new Date(target.getTime() - offsetMs);
    if (notifyTime > now) {
      const ms = notifyTime - now;
      const id = setTimeout(() => {
        new Notification({
          title: 'Tarefa Semanal',
          body: `${task.text} às ${task.time}`,
          silent: !cfg.notificationSound,
          sound: cfg.notificationSound || undefined
        }).show();
      }, ms);
      notificationTimers.push(id);
    }
  });

  // Daily
  (cfg.daily || []).forEach(task => {
    const target = new Date(task.datetime);
    const notifyTime = new Date(target.getTime() - offsetMs);
    if (notifyTime > now) {
      const ms = notifyTime - now;
      const id = setTimeout(() => {
        const time = target.toTimeString().slice(0,5);
        new Notification({
          title: 'Tarefa Pontual',
          body: `${task.text} às ${time}`,
          silent: !cfg.notificationSound,
          sound: cfg.notificationSound || undefined
        }).show();
      }, ms);
      notificationTimers.push(id);
    }
  });
}

function createWallpaper() {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  wallpaperWin = new BrowserWindow({ x, y, width, height,
    frame: false, transparent: true, resizable: false, skipTaskbar: true,
    focusable: true, webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  wallpaperWin.loadFile('index.html');
  wallpaperWin.setIgnoreMouseEvents(true, { forward: true });
}

function createSettings() {
  settingsWin = new BrowserWindow({
    width: 950, height: 700, title: 'Configurar Tarefas', resizable: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
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

ipcMain.handle('save-config', async (_, config) => {
  fs.writeFileSync('config.json', JSON.stringify(config));
  wallpaperWin.webContents.send('config-updated');
  scheduleNotifications();
});
ipcMain.handle('load-config', () => loadConfig());
ipcMain.handle('request-clicks-state', () => clicksEnabled);

app.whenReady().then(() => {
  createWallpaper(); createSettings(); createTray(); scheduleNotifications();
});
app.on('window-all-closed', () => app.quit());