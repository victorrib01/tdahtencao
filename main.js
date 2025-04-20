// Adicione aos imports
const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, screen } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');
const fs = require('fs');
const wallpaper = require('wallpaper');

// Auto-inicialização
const autoLauncher = new AutoLaunch({
  name: 'TDAHTENÇÃO',
  path: app.getPath('exe')
});

let win;
let wallpaperWin;

// Verificar/ativar início automático
function checkAutoLaunch() {
  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLauncher.enable();
  });
}

// Criar janela com transparência e sempre no topo
function createWindow() {
  win = new BrowserWindow({
    width: 400, 
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { 
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true // Adicione esta linha
    }
  });
  
  // Garante que os inputs funcionarão
  win.on('focus', () => {
    win.webContents.executeJavaScript(`
      document.querySelectorAll('input').forEach(i => {
        i.blur();
        i.focus();
      });
    `);
  });
  
  win.loadFile('index.html');
  win.setAlwaysOnTop(true, 'screen-saver');
}
// Função para capturar conteúdo e definir como wallpaper
async function setApplicationAsWallpaper() {
  const renderWin = new BrowserWindow({
    show: false,
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    webPreferences: { offscreen: true }
  });
  
  renderWin.loadFile('wallpaper.html');
  
  renderWin.webContents.once('did-finish-load', async () => {
    const image = await renderWin.webContents.capturePage();
    const tempPath = path.join(app.getPath('temp'), 'tdah-wallpaper.png');
    
    fs.writeFileSync(tempPath, image.toPNG());
    await wallpaper.set(tempPath);
    
    renderWin.close();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icons/icon-192.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Visibilidade', submenu: [
      { label: 'Normal', type: 'radio', checked: true, click: () => win.setOpacity(1.0) },
      { label: '75%', type: 'radio', click: () => win.setOpacity(0.75) },
      { label: '50%', type: 'radio', click: () => win.setOpacity(0.5) },
      { label: '25%', type: 'radio', click: () => win.setOpacity(0.25) },
    ]},
    { label: 'Sempre Visível', type: 'checkbox', checked: true, click: (item) => 
      win.setAlwaysOnTop(item.checked) },
    { label: 'Modo', submenu: [
      { label: 'Normal', type: 'radio', checked: true, click: () => {
        win.webContents.executeJavaScript('setAppMode("normal")');
      }},
      { label: 'Foco', type: 'radio', click: () => {
        win.webContents.executeJavaScript('setAppMode("focus")');
      }},
      { label: 'Sem Distrações', type: 'radio', click: () => {
        win.webContents.executeJavaScript('setAppMode("distraction-free")');
      }}
    ]},
    { label: 'Atualizar Wallpaper', click: () => setApplicationAsWallpaper() },
    { type: 'separator' },
    { label: 'Iniciar com o Sistema', type: 'checkbox', checked: true, 
      click: (item) => item.checked ? autoLauncher.enable() : autoLauncher.disable() },
    { type: 'separator' },
    { label: 'Abrir', click: () => win.show() },
    { label: 'Sair', click: () => app.quit() }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('TDAHTENÇÃO');
}

function registerShortcuts() {
  // Mostrar/esconder
  globalShortcut.register('Alt+T', () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });
  
  // Nova tarefa
  globalShortcut.register('Alt+N', () => {
    win.webContents.executeJavaScript('document.getElementById("open-modal").click()');
  });
  
  // Foco em pomodoro
  globalShortcut.register('Alt+P', () => {
    win.webContents.executeJavaScript('startPomodoroShortcut()');
  });
}

// Inicialização principal
app.whenReady().then(() => {
  checkAutoLaunch();
  createWindow();
  createTray();
  registerShortcuts();
  setApplicationAsWallpaper(); // Define o wallpaper
});

// Manipuladores de eventos do sistema
app.on('system-theme-changed', () => {
  win.webContents.executeJavaScript('systemThemeChanged()');
});

// Evitar que o app feche quando todas as janelas fecham (ficará na bandeja)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Não sair automaticamente no macOS
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});