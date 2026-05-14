import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ build
// │ │ └── index.html
// │ │
// │ ├─┬ dist
// │ │ └── main.js
// │ └── preload.mjs
//
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - because Vite overrides these variables
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'build');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

// ── Windows: set AppUserModelId BEFORE app is ready ──────────────────────────
// REQUIRED for the taskbar icon to update correctly on Windows.
// Must match the appId in package.json build config.
if (process.platform === 'win32') {
  app.setAppUserModelId('com.apilot.app');
}

// ── Logo / icon paths ─────────────────────────────────────────────────────────
const ICON_PATH = path.join(process.env.VITE_PUBLIC, 'assets', 'images', 'logo', 'icon.png');
const appIcon = nativeImage.createFromPath(ICON_PATH);

let win: BrowserWindow | null;
let tray: Tray | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    // ── Window / taskbar icon ─────────────────────────────────────────────────
    // Use string path (not nativeImage) — more reliable on Windows for taskbar
    icon: ICON_PATH,
    title: 'aPilot',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Force-apply icon after page load — fixes Windows taskbar not reflecting changes
  win.webContents.on('did-finish-load', () => {
    win?.setIcon(ICON_PATH);
    win?.webContents.send('main-process-message', (new Date()).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// ── macOS About panel ─────────────────────────────────────────────────────────
function setupAboutPanel() {
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'aPilot',
      applicationVersion: app.getVersion(),
      iconPath: ICON_PATH,
      copyright: `© ${new Date().getFullYear()} aPilot`,
    });
  }
}

// ── System Tray ───────────────────────────────────────────────────────────────
function createTray() {
  const trayIcon = appIcon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open aPilot',
      click: () => {
        win?.show();
        win?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip('aPilot');
  tray.setContextMenu(contextMenu);

  // Double-click tray icon → restore window
  tray.on('double-click', () => {
    win?.show();
    win?.focus();
  });
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ── macOS Dock icon ───────────────────────────────────────────────────────────
if (process.platform === 'darwin') {
  app.dock?.setIcon(appIcon);
}

app.whenReady().then(() => {
  setupAboutPanel();
  createWindow();
  createTray();
});

// ── Winget IPC Handlers ───────────────────────────────────────────────────────

ipcMain.handle('winget:list', async () => {
  try {
    const { stdout, stderr } = await execAsync('powershell -NoProfile -ExecutionPolicy Bypass -Command "winget list --accept-source-agreements"', {
      maxBuffer: 1024 * 1024,
      windowsHide: true
    })
    const lines = stdout.split('\n').filter(line => line.trim() !== '');

    if (lines.length < 3) return [];

    // Find the header line and the separator line
    const headerLine = lines.find(l => l.includes('Name') && l.includes('Id'));
    if (!headerLine) return [];

    const separatorIndex = lines.indexOf(headerLine) + 1;
    const separatorLine = lines[separatorIndex];

    // Determine column positions based on the separator line (dashes)
    const columns: { start: number; end: number }[] = [];
    let start = 0;
    for (let i = 0; i < separatorLine.length; i++) {
      if (separatorLine[i] === ' ' && separatorLine[i - 1] === '-') {
        columns.push({ start, end: i });
        start = i + 1;
      }
    }
    columns.push({ start, end: separatorLine.length });

    const headers = columns.map(col => headerLine.substring(col.start, col.end).trim());

    const result = lines.slice(separatorIndex + 1).map(line => {
      const entry: any = {};
      columns.forEach((col, index) => {
        const key = headers[index].toLowerCase();
        entry[key] = line.substring(col.start, col.end).trim();
      });
      return entry;
    });

    return result;
  } catch (error) {
    console.error('Winget list error:', error);
    return [];
  }
});

ipcMain.handle('winget:upgrade', async (event, id: string) => {
  try {
    const { stdout } = await execAsync(`winget upgrade --id ${id} --silent --accept-package-agreements --accept-source-agreements`);
    return { success: true, output: stdout };
  } catch (error: any) {
    console.error('Winget upgrade error:', error);
    return { success: false, error: error.message };
  }
});
