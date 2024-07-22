const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("fs");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 660,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  //load the index.html from a url
  win.loadURL("http://localhost:5173");

  // Open the DevTools.
  // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

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

// IPC handler to save a text file
ipcMain.handle("save-file", async (_event, filePath, content) => {
  fs.writeFileSync(filePath, content, "utf-8");
  return { status: "success" };
});

ipcMain.handle("delete-file", async (_event, filePath) => {
  fs.unlinkSync(filePath, () => {});
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
    const files = fs.readdirSync(dirPath);

    const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');

    const base64Jpgs = jpgFiles.map(jpg => {
      const filePath = path.join(dirPath, jpg);
      const data = fs.readFileSync(filePath);
      return {jpg: data.toString('base64'), fileName: jpg};
    });

    return { status: 'success', data: base64Jpgs };
  } catch (error) {
    console.error('Error loading JPG files:', error);
    return { status: 'failure', error: error.message };
  }
});

ipcMain.handle('copy-file', async (_event, sourceFilePath, destDirPath) => {
  try {
    const fileName = path.basename(sourceFilePath);
    const destFilePath = path.join(destDirPath, fileName);

    fs.copyFileSync(sourceFilePath, destFilePath);

    return { status: 'success' };
  } catch (error) {
    console.error('Error copying file:', error);
    return { status: 'failure', error: error.message };
  }
});