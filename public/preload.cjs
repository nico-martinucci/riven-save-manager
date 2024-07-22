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
  },
  selectDirectory: async () => {
    return ipcRenderer.invoke('select-directory');
  },
  checkDirExists: async (dirPath) => {
    return ipcRenderer.invoke('check-dir-exists', dirPath);
  },
  saveDirPath: async (dirPath, key) => {
    return ipcRenderer.invoke('save-dir-path', dirPath, key)
  },
  loadDirPath: async (key) => {
    return ipcRenderer.invoke('load-dir-path', key)
  }
});