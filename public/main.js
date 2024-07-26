import {app, BrowserWindow, ipcMain, dialog} from "electron"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "node:path"
import fs from 'fs'
import os from 'os'
import url from 'url'
import Store from 'electron-store'
import sudo from 'sudo-prompt'
import isDev from 'electron-is-dev'
import { fromGvas, toCurated, toGvas } from "../src/gvasparser.js";
import { rivenProperties, selectRivenProperties } from "../src/riven.js";

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: isDev ? 1600 : 800,
    height: 710,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  //load the index.html from a url
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173")
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Open the DevTools.
  isDev && mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('did-fail-load', () => {
    console.error('Window failed to load');
  });
}

app.on('ready', () => {
  if (os.platform() === 'win32') {
    requestAdminPermissions();
  }
  createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const getExpandedDir = (dir) => {
  if (dir.startsWith('~')) {
    return path.join(os.homedir(), dir.slice(1));
  }

  return dir
}

const requestAdminPermissions = () => {
  const options = {
    name: 'Riven Save Manager',
  };

  sudo.exec('echo hello', options, (error, stdout, stderr) => {
    if (error) throw error;
    console.log('stdout: ' + stdout);
  });
};

app

// IPC handler to save a text file
ipcMain.handle("save-file", async (_event, filePath, content) => {
  fs.writeFileSync(filePath, content, "utf-8");
  return { status: "success" };
});

ipcMain.handle("delete-file", async (_event, filePath) => {
  fs.unlinkSync(filePath);
  return { status: "success" };
});

ipcMain.handle(
  "delete-files",
  async (_event, dirPath, fileExtension, filesToDelete) => {
    try {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        if (path.extname(file) === fileExtension && (filesToDelete ? filesToDelete.includes(file.split(".")[0]) : true)) {
          fs.unlinkSync(path.join(dirPath, file));
        }
      });

      return { status: "success" };
    } catch (error) {
      console.error("Error deleting files:", error);
      return { status: "failure", error: error.message };
    }
  }
);

ipcMain.handle('load-jpg', async (_event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    const base64Data = data.toString('base64');
    return { status: 'success', data: base64Data };
  } catch (error) {
    console.error('Error reading JPG file:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('load-jpgs-in-dir', async (_event, dirPath) => {
  try {
    dirPath = getExpandedDir(dirPath)

    const files = fs.readdirSync(dirPath);

    const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');

    const base64Jpgs = jpgFiles.map(jpg => {
      const filePath = path.join(dirPath, jpg);
      const data = fs.readFileSync(filePath);
      return { jpg: data.toString('base64'), fileName: jpg };
    });

    return { status: 'success', data: base64Jpgs };
  } catch (error) {
    console.error('Error loading JPG files:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('copy-file', async (_event, sourceFilePath, destDirPath, newFileName = null) => {
  try {
    const fileName = newFileName || path.basename(sourceFilePath);
    const destFilePath = path.join(destDirPath, fileName);

    fs.copyFileSync(sourceFilePath, destFilePath);

    return { status: 'success' };
  } catch (error) {
    console.error('Error copying file:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return { status: 'cancelled' };
  } else {
    return { status: 'success', path: result.filePaths[0] };
  }
});

ipcMain.handle('check-dir-exists', async (_event, dirPath) => {
  try {
    dirPath = getExpandedDir(dirPath)

    const exists = fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
    return { status: 'success', expandedDir: exists ? dirPath : "" };
  } catch (error) {
    console.error('Error checking directory existence:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('save-dir-path', async (_event, dirPath, key) => {
  try {
    store.set(key, dirPath);
    return { status: 'success' };
  } catch (error) {
    console.error('Error saving directory path:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('load-dir-path', async (key) => {
  try {
    const dirPath = store.get(key);
    return { status: 'success', dirPath };
  } catch (error) {
    console.error('Error loading directory path:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('clear-dir-path', async (key) => {
  try {
    store.delete(key)
    return { status: 'success' };
  } catch (error) {
    console.error('Error loading directory path:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('get-os', async () => {
  try {
    return os.platform()
  } catch (error) {
    console.error('Error getting OS:', error);
    return {status: 'failure', error: error.message}
  }
})

ipcMain.handle('create-random-save', async () => {
  const file = fs.readFileSync(path.join(__dirname, './Slot0GameState.sav'));
  const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  const saveObject = fromGvas(arrayBuffer)
  toCurated(selectRivenProperties, saveObject.properties, 'riven')
  let output = toGvas(saveObject);
  const saveDirectory = path.join(os.homedir(), 'Library/Application Support/Epic/Riven/Saved/SaveGames');
  const outputFilePath = path.join(saveDirectory, 'Slot0GameState.sav');
  fs.writeFileSync(outputFilePath, Buffer.from(output));
})