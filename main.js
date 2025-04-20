// main.js
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

// carrega o addon nativo que expõe `setAsWallpaper(HWND)`
const desktop = require(path.join(__dirname, 'native', 'build', 'Release', 'desktop.node'));

let mainWindow;
let wallpaperWindow;
let tray;

function createWindows() {
  // 1) Janela interativa normal
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.html');

  // 2) Janela “wallpaper” (transparent & click‑through)
  wallpaperWindow = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    transparent: true,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  wallpaperWindow.setIgnoreMouseEvents(true, { forward: true });
  wallpaperWindow.loadFile('index.html');

  // 3) Assim que estiver pronta, “encaixa” atrás dos ícones
  wallpaperWindow.once('ready-to-show', () => {
    const handle = wallpaperWindow.getNativeWindowHandle();
    // handle já é um Buffer com o HWND
    desktop.setAsWallpaper(handle);
  });

  // Se o usuário fechar a janela interativa, encerra o app
  mainWindow.on('closed', () => {
    app.quit();
  });
}

function setupTray() {
  tray = new Tray(path.join(__dirname, 'icon.png')); // um ícone PNG ou ICO de 16x16/32x32
  const ctxMenu = Menu.buildFromTemplate([
    { label: 'Abrir Cronograma', click: () => switchToInteractive() },
    { label: 'Modo Wallpaper', click: () => switchToWallpaper() },
    { type: 'separator' },
    { label: 'Sair', click: () => app.quit() }
  ]);
  tray.setToolTip('Cronograma TDH++');
  tray.setContextMenu(ctxMenu);
}

function switchToWallpaper() {
  if (mainWindow) mainWindow.hide();
  if (wallpaperWindow) wallpaperWindow.show();
}

function switchToInteractive() {
  if (wallpaperWindow) wallpaperWindow.hide();
  if (mainWindow) mainWindow.show();
}

// IPC para permitir que o renderer também mande trocar
ipcMain.on('wallpaper-mode', switchToWallpaper);
ipcMain.on('interactive-mode', switchToInteractive);

// App ready
app.whenReady().then(() => {
  createWindows();
  setupTray();

  // No macOS, recria se o dock icon for clicado e não houver janelas
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });
});

// Fecha completamente em todas as plataformas quando todas as janelas fecharem
app.on('window-all-closed', () => {
  app.quit();
});
