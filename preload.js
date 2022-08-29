const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('dialogAPI', {
    openDialog(result) {
      ipcRenderer.send('show-open-dialog',result);
    }
  });

ipcRenderer.on('open-dialog-reply', (event, data) => {
    document.querySelector('#isCancelledText').innerHTML = data.canceled;
    document.querySelector('#filepathsText').innerHTML = data.filePaths.join('\n');
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  }); 

