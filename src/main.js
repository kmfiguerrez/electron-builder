const { app, BrowserWindow, ipcMain } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const { autoUpdater } = require("electron-updater")

// Auto updater flags
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      win.loadURL("app://-");
    });

    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-available', () => {
      const message = {
        type: 'info',
        buttons: ['Update Now', 'Later'],
        title: 'Update Available',
        detail: 'A new version of the app is available. Do you want to update now?',
      };
  
      dialog.showMessageBox(mainWindow, message).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });
  
    autoUpdater.on('update-downloaded', (updateInfo) => {
      const message = {
        type: 'info',
        buttons: ['Restart', 'Cancel'],
        title: 'Update Downloaded',
        detail: `New version ${updateInfo.version} downloaded. Restart the app to install.`,
      };
  
      dialog.showMessageBox(mainWindow, message).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  
    autoUpdater.on('error', (error) => {
      console.error('Error in auto-updater:', error);
      // Handle errors (optional)
    });

  } 
  else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  
  createWindow()

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});