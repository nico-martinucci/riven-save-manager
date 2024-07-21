const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveFile: async (filePath, content) => {
    return ipcRenderer.invoke('save-file', filePath, content);
  },
  deleteFile: async (filePath) => {
    return ipcRenderer.invoke('delete-file', filePath);
  },
  deleteFiles: async (dirPath, fileExtension, filesToDelete) => {
    return ipcRenderer.invoke('delete-files', dirPath, fileExtension, filesToDelete)
  },
  loadJpg: async (filePath) => {
    return ipcRenderer.invoke('load-jpg', filePath);
  },
  loadJpgsInDir: async (dirPath) => {
    return ipcRenderer.invoke('load-jpgs-in-dir', dirPath)
  },
  copyFile: async (sourceFilePath, destDirPath) => {
    return ipcRenderer.invoke('copy-file', sourceFilePath, destDirPath)
  }
});