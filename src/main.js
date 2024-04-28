const { app, BrowserWindow, ipcMain } = require("electron");
const serve = require("electron-serve");
const path = require("path");

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
  } else {
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
})

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});