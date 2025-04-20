const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');

let win;
let tray;
let clicksEnabled = false;

function createWindow() {
  // Obtém área de trabalho excluindo a barra de tarefas
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('index.html');

  // Bloqueia cliques fora da checklist, mas mantém forward para o desktop
  win.setIgnoreMouseEvents(true, { forward: true });
}

function createTray() {
  const svgIcon = `
    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\">
      <circle cx=\"8\" cy=\"8\" r=\"7\" fill=\"#4A90E2\" stroke=\"#fff\" stroke-width=\"1\" />
      <path d=\"M5 8l2 2 4-4\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" />
    </svg>`;

  const iconImage = nativeImage.createFromBuffer(Buffer.from(svgIcon));
  tray = new Tray(iconImage);
  tray.setToolTip('Todo Wallpaper');
  updateTrayMenu();
}

function updateTrayMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: clicksEnabled ? 'Bloquear Checklist' : 'Desbloquear Checklist',
      click: () => toggleClicks()
    },
    { type: 'separator' },
    { label: 'Sair', role: 'quit' }
  ]);
  tray.setContextMenu(menu);
}

function toggleClicks() {
  clicksEnabled = !clicksEnabled;

  if (clicksEnabled) {
    // Permite capturar cliques na janela (para a checklist funcionar)
    win.setIgnoreMouseEvents(false);
  } else {
    // Bloqueia cliques, mas forward: true mantém o desktop interagível
    win.setIgnoreMouseEvents(true, { forward: true });
  }

  // Notifica renderer para ativar/desativar a área clicável
  win.webContents.send('toggle-clicks', clicksEnabled);
  updateTrayMenu();
}

ipcMain.handle('request-clicks-state', () => clicksEnabled);

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => app.quit());