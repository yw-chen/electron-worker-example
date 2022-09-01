const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html');
    ipcMain.on('show-open-dialog',(event,data) => {
        dialog.showOpenDialog({properties: ['openFile', 'multiSelections'],data}).then(filePaths => {
            event.sender.send('open-dialog-reply',filePaths);
        })
      });
}

app.whenReady().then(()=>{
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })