const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');

// carregue o módulo nativo
const desktop = require(path.join(__dirname, 'native', 'build', 'Release', 'desktop.node'));

let win, tray, isWallpaper = false;

function createWindow() {
  win = new BrowserWindow({
    width: 600, height: 400,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
  buildTray();
}

function buildTray() {
  tray = new Tray(path.join(__dirname, 'assets','icons', 'icon-192.png'));
  updateMenu();
}

function updateMenu() {
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: isWallpaper ? 'Abrir App' : 'Wallpaper Mode',
      click: toggleWallpaperMode
    },
    { role: 'quit', label: 'Sair' }
  ]));
}

function toggleWallpaperMode() {
  const hwndBuf = win.getNativeWindowHandle();
  // Para x64:
  const hwnd = hwndBuf.readUInt32LE(0);

  if (!isWallpaper) {
    // cola atrás dos ícones
    desktop.attach(hwnd);
    // e torna click‑through
    win.setIgnoreMouseEvents(true, { forward: true });
    win.setAlwaysOnTop(true, 'screen-saver');
    // maximize cobre toda a tela
    const { width, height } = screen.getPrimaryDisplay().workArea;
    win.setBounds({ x: 0, y: 0, width, height });
  } else {
    // restaura para janela normal
    desktop.detach(hwnd);
    win.setIgnoreMouseEvents(false);
    win.setAlwaysOnTop(false);
    win.unmaximize();
    win.setSize(600, 400);
    win.center();
  }

  isWallpaper = !isWallpaper;
  updateMenu();
  // informe ao renderer se quiser esconder badges, etc.
  win.webContents.send('wallpaper-state', isWallpaper);
}

app.whenReady().then(createWindow);

ipcMain.handle('toggle-wallpaper', () => {
  toggleWallpaperMode();
  return isWallpaper;
});
