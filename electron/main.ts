import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import http from 'node:http';

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
  // ── Preload Path Resolution ────────────────────────────────────────────────
  // In dev, vite-plugin-electron might put it in 'dist' or nearby.
  // We check multiple common locations to be robust.
  const preloadPaths = [
    path.join(MAIN_DIST, 'preload.mjs'),
    path.join(MAIN_DIST, 'preload.js'),
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'preload.js'),
  ];

  const preload = preloadPaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }) || preloadPaths[0];

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    // ── Window / taskbar icon ─────────────────────────────────────────────────
    // Use string path (not nativeImage) — more reliable on Windows for taskbar
    icon: ICON_PATH,
    title: 'aPilot',
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove default menu (File, Edit, View, etc.)
  win.setMenu(null);

  // Force-apply icon after page load — fixes Windows taskbar not reflecting changes
  win.webContents.on('did-finish-load', () => {
    win?.setIcon(ICON_PATH);
    win?.webContents.send('main-process-message', (new Date()).toLocaleString());
  });

function startLocalServer(): Promise<number> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url || '/';
      urlPath = urlPath.split('?')[0];

      let filePath = path.join(RENDERER_DIST, urlPath);
      
      // SPA Fallback: If file doesn't exist, serve index.html
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(RENDERER_DIST, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as any).port);
    });
  });
}

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open DevTools automatically in development mode
    win.webContents.openDevTools();
  } else {
    // Start local server to support Service Workers (MSW), Absolute Paths, and HTML5 Routing
    startLocalServer().then((port) => {
      win?.loadURL(`http://127.0.0.1:${port}`);
    });
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
    const { stdout } = await execAsync('powershell -NoProfile -ExecutionPolicy Bypass -Command "winget list --accept-source-agreements"', {
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });

    // Clean up lines: remove progress indicators and empty lines
    const rawLines = stdout.split(/\r?\n/).map(l => l.replace(/^[\s\-\|\/\\]+/, '').trimEnd());
    const lines = rawLines.filter(line => line.trim() !== '');

    // Find the header line
    const headerIndex = lines.findIndex(l => l.includes('Name') && l.includes('Id'));
    if (headerIndex === -1) return [];

    const headerLine = lines[headerIndex];

    // Define the headers we expect
    interface ColDef {
      name: string;
      start: number;
      end?: number;
    }

    const headerKeywords = ['Name', 'Id', 'Version', 'Available', 'Source'];
    const colDefs: ColDef[] = headerKeywords
      .map(h => ({ name: h, start: headerLine.indexOf(h) }))
      .filter(h => h.start !== -1)
      .sort((a, b) => a.start - b.start);

    // Calculate end positions for each column
    for (let i = 0; i < colDefs.length; i++) {
      colDefs[i].end = i < colDefs.length - 1 ? colDefs[i + 1].start : undefined;
    }

    // Parse data rows
    const result = lines.slice(headerIndex + 2).map(line => {
      const entry: any = {};
      colDefs.forEach(col => {
        const value = col.end
          ? line.substring(col.start, col.end).trim()
          : line.substring(col.start).trim();
        entry[col.name.toLowerCase()] = value;
      });
      return entry;
    });

    // Sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name));

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
