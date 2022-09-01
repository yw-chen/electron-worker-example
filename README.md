# 用Node.js寫桌面應用程式-Electronjs
身為一個長年在Windows系統工作的開發者
在開發桌面應用程式的時候總是會遇到一個經典的問題：要用什麼東西寫介面？
如果使用方便簡易的winForm，雖然開發起來速度很快，但是每次都會被客戶嫌醜；
使用付費的Qt又不好客製化，而且價格不菲($302 month/per-user)
其他的方案五花八門，不是用的人少，就是學起來門檻很高。
相比在Web的前端有許多不同的框架如react, angular, vue...等
且許多介面設計工具也能將頁面設計直接產生html＋css，能夠快速的進入開發
因此多方考量之下，Electron就馬上的浮出水面了

## 有哪些產品使用了Electron
![](https://hackmd.io/_uploads/SJUAd9YJj.png)
除了上面的幾個產品以外，WhatApp、Microsoft Teams、InVision等軟體，也都是用Electron

## 什麼是Electronjs，為什麼要用它
Electron官方給的定義是
" 使用**Javascript** + **HTML** + **CSS**來建立**跨平台**的**桌面應用程式** "

重要的Feature可以歸納為以下幾點：
* 使用Web技術：核心是chromium + node.js:
無論是開發的方式或程式行為都與Web app有87%相似。因此可以讓全端工程師很快速的用相同的技能樹，去開發桌面版本的應用程式。

* 開源與健全的社群：目前由OpenJS Foundation維護，社群貢獻者眾
103K Stars, 13.8k forks, 最後一次維護2022/08/26
![](https://hackmd.io/_uploads/rJo9x2F1j.png)
[link](https://github.com/electron/electron")

* 跨平台支援：可以編譯Windows, MacOS, Linux App
不需要在不同平台上使用不同的介面工具，也沒有大量的系統編譯相依設定
> *部分行為會因為不同作業系統略有不同，需要分開處理，如後述的app視窗的新增與生命週期控制

* 方便存取本地資源
electron有包裝可以在不同OS中使用的檔案工具，不需要特別處理權限以及使用如ajax套件來處理互動問題

* 硬體資源的可及性 
electron app可以使用任何有提供API給Javascript或node.js plugin的硬體控制工具
如GPU Framework，可與硬體設備直接互動；與傳統C系列語言、java、python等有相近的便利性

> 其他的Feature可以詳閱官方的說明

#### 接著就來建立一個簡單的桌面應用程式吧！

## 如何建立一個最基本的Electron App

### 需要預先準備的工具

1. 合用的IDE工具，如VSCode
2. CLI工具，terminal就可以了
3. nodejs與npm
```
// 我目前使用的版本，詳細請參閱electron發布的相容性
$ node -v
v16.14.2
$ npm -v
8.5.0
```

### Hello World!
為了展示electron本身單純(x的架構，這邊就先以官方的Hello World教學展示
> 由於官方教學並沒有採用任何的資料夾架構，容易引起部分人嚴重反胃，請斟酌觀看

首先初始一個專案，請自行設定喜歡的名稱
![](https://hackmd.io/_uploads/rkbntqtki.png)
> 如果想對npm init了解更多(?，請參閱以下網址
> https://docs.npmjs.com/cli/v8/commands/npm-init

安裝electron套件為編譯階段相依
```clike!
# CLI
# -------------------------------
npm install --save-dev electron
```

修改pakcage.json的起始設定:
1. 將main改成main.js
2. 將start的工具設定為electron，目錄使用專案根目錄"."
```jsonld!
// package.json
// -------------------------------
...
"main": "main.js",
...
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron ."
  },
...
```

#### 接下來就是程式本體了

首先我們要新增一個程式的進入點main.js。由於一般app的進入點習慣取名index，electron的功能是要包裹app，因此用main比較不會搞混。所以在後面看到index相關檔案的時候，可以自動歸在app的部分
```javascript!
// main.js
// -----------------------------
const {app, BrowserWindow} = require('electron');

// app的起始方法宣告
const createWindow = () => {
    // app本體，基本的視窗屬性定義
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // 是否讓renderer可以用node.js功能，因為有安全性問題，官方建議不要開
            nodeIntegration: false,
            // 在視窗起始前，預先執行一些程式
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // 讀取app的進入點
    win.loadFile('index.html');
}

// 當electron app初始化完成後，才啟動app視窗
app.whenReady().then(()=>{
    createWindow();
    
    // Mac OS在所有window都關閉時，不會將應用程式結束，因此新增透過接聽active事件
    // 來建立新的視窗
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

// Windows / Linux的應用程式通常在所有視窗都關閉後就會結束
// 但Mac OS則習慣會讓app在背景運行，單純關閉視窗並不會結束app，可以用應用程式選單來關閉Electron App
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
```

> 順帶一提，也可以用win.loadURL('https://github.com')當成單純的Browser用

接著新增一個html頁面
```htmlmixed!
<!--index.html-->
<!---------------------------------->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using Node.js <span id="node-version"></span>,
    Chromium <span id="chrome-version"></span>,
    and Electron <span id="electron-version"></span>.
    
    <!-- renderer script-->
    <script src="renderer.js"></script>
  </body>
</html>
```

前面在設定renderer的BrowserWindow時有設定一個preload的script，這邊我們新增一個在進入renderer之前讀取一些相關模組的資料功能
```javascript!
// Preload
// --------------------------
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  }); 

```

為了不要讓log報錯，這邊新增一個空白的renderer.js
```
// renderer.js
// ----------------------
```

最後就可以Run個app看結果
```
npm start
```
![](https://hackmd.io/_uploads/BygbUcayo.png)

題外話：因為electron使用了chromium為基礎，想當然的也就可以在app中開啟chrome附帶的debug工具；以MacOS為例，可以在應用程式選單中的"View"下面，找到"Toggle Developer Tools"，就可以開啟熟悉的好朋友
![](https://hackmd.io/_uploads/B1y-estys.png)

> 這邊主要是介紹Electron的基本用法，如果想要建立electron + react的app，可以使用別人預先建立好的boilerplate
> https://github.com/electron-react-boilerplate/electron-react-boilerplate
> 以下連結是完整使用教學，麻煩有空自己看
> https://blog.bitsrc.io/building-an-electron-app-with-electron-react-boilerplate-c7ef8d010a91

### 簡單的部分看完了，接下來看一下Electron的運行架構

## Process Model[4]
由於Electron的運行架構是繼承於Chromium的設計，因此我們可以從圖的Chrome/Edge程式運行架構來說明；當要執行Chrome瀏覽網頁時，會由主程式作為Process Manager，並開啟多個Process來各自負責不同的網頁瀏覽。而Electron中，這兩個實作被稱為main跟renderer
![](https://hackmd.io/_uploads/Sk2S1Jqyo.png)
這個設計我們可以從程式執行的活動觀察到，除了主程式自己本身的執行序以外，每一個對應的頁面會有相對應的子執行序，也就是說chromium的應用程式本身是個多執行序的架構
![](https://hackmd.io/_uploads/ryCrlhhko.png)
這是因為傳統的單一執行序的瀏覽器，在其中的一個頁面有bug，時常會影響到整個瀏覽器，導致程式卡死。因此Chromium將不同的頁面分開執行序，避免互相影響。不過多執行序的設計也更吃CPU與記憶體，也不是全然只有好處。
> 題外話：Edge目前有實作頁面休眠機制，可以節省一些資源

### main
每一個electron應用程式只會有一個運行在node.js環境下的main程序，作為應用程式的進入點。這個程序主要的目的，是管理視窗的生成與生態，也就是前面我們app.whenReady().then的這一系列動作。同時這個進入點因為是run在node.js上，可以require外部模組以及所有Node.js的API

### renderer
Renderer是Electron為了開啟BrowserWindow而產生的程序，主要負責Web內容的Render。可以用以下三點描述：
1. HTML的頁面作為renderer的入口
2. 使用CSS檔案設計Style
3. 使用script執行JavScript的程式
雖然前面實作簡單範例的時候，有提到可以透過BrowserWindow的nodeIntegration屬性，開啟renderer中使用node.js功能，不過因為會造成安全性的問題，建議是不要開啟這個功能
但如果想要在renderer當中使用node.js的功能有什麼辦法？
其中一個方法是使用Electron原生提供的IPC(Inter-Process Communication)機制，讓renderer可以透過listener / handler的方式使用main process中的外部工具，這個部分稍後會用範例簡單說明
另一個方式，則是必須透過Toolchain的bundler工具，如webpack或parcel等工具，將renderer內使用的npm package打包成靜態資源。
> 由於我跟webpack很不熟，就不多介紹

### Preload
除了main與renderer之外，electron還有一個preload的機制，讓使用者可以在進入renderer之後，且在讀取web頁面之前可以執行一些程式。而且preload雖然會運行在renderer的context之中，但是可以使用node.js api先做一些事。如同前面的範例當中，在preload的時候先讀取相關工具的版本號；或者例如想要將main process的一些屬性分享給renderer，就可以透過preload與renderer的共同全域變數window(BrowserWindow)，將變數寫ContextBridge在API方法中，再於renderer階段取用，不過由於preload有預設contextIsolation的安全性設定，雖然preload跟renderer都可以跟window溝通，但是無法將任何變數直接附加給window(如preload.js中的錯誤寫法)，而是必須透過contextBridge的方法傳遞訊息
```javascript!
// preload.js
// ------------------

// 錯誤的寫法
window.myAPI = {
  desktop: true,
}

//正確的寫法
const { contextBridge } = require('electron')

// myAPI註冊為window的屬性，並回傳其方法
contextBridge.exposeInMainWorld('myAPI', {
  desktop: true,
})
```

```javascript!
renderer.js
-----------------
console.log(window.myAPI)
// => { desktop: true }
```

## 使用electron存取本地檔案 - IPC + preload
前面提到electron提供了IPC(Inter-Process Communication)機制，讓原本獨立main跟renderer的兩個process，可以互相溝通與傳遞方法。在IPC的設計當中，ipcMain與ipcRenderer的訊息傳遞是透過一個使用者自定的"channel"；這個channel可以當成是溝通訊息或方法的名稱，除了可以任意的命名，也可以在兩個模組中使用相同的channel，也就是說可以從ipcMain呼叫ipcRenderer提供的"myAPI"，同時ipcRenderer也可以呼叫ipcMain提供的"myAPI"，兩者並不衝突[5]

接著我們用一個"存取本地檔案"的功能，來實際寫一個IPC功能。

目標是要在renderer的頁面當中，新增一個可以開啟本地檔案選取視窗的按鈕，並且將選取的結果顯示在頁面當中。因此我們會需要完成以下幾個部分
* main將electron的dialog功能透過ipc給renderer使用
* 在main的dialog操作完成後，將結果傳給renderer
* renderer暴露可以接收結果的ipc handler

#### 在main.js中建立一個ipcMain的handler。
首先我們需要一個"開啟檔案瀏覽"的方法。
在electron中有包裝對話視窗有關的模組dialog，其中showOpenDialog就是開啟檔案的功能
> dialog還有其他功能如showMessageBox、showSaveDialog等
因此在main.js當中，我們需要先匯入dialog跟ipcMain的模組；ipcMain是main process中註冊ipc listener的介面。
其中show-open-dialog為channel的名稱，後面的方法則是litsener
由於想要將開啟檔案的結果回傳給renderer，showOpenDialog後面接著一個sender去呼叫接下來我們會新增的open-dialog-reply方法
> 更多用法可以參考
> https://www.electronjs.org/docs/latest/api/ipc-main
```javascript!
// main.js
// -----------------------------
const {..., dialog, ipcMain} = require('electron');

const createWindow = () => {
    ...
    // receive request from renderer in channel 'show-open-dialog'
    ipcMain.on('show-open-dialog',(event,data) => {
        dialog.showOpenDialog({properties: ['openFile', 'multiSelections'],data}).then(filePaths => {            
    // then send a request to renderer in channel 'open-dialog-reply'
            event.sender.send('open-dialog-reply',filePaths);
        })
      });
}
```
> ipcMain的handler註冊不一定要放在createWindow的方法裡，放在外面也可以work，不過官方是這麼寫，這邊就先依照他的寫法

接著在preload.js當中，新增對應的處理方法:
第一段是呼叫ipcMain中的show-open-dialog，其中contextBridge.exposeInMainWorld會將api暴露到renderer當中，dialogAPI則是是api的名稱，在renderer中會以window.dialogAPI的方式使用它；而後面{}則是api的本體，可以是int, text或其他類型，這次是採用object的形式，以便使用時可以用window.dialogAPI.openDialog的方式呼叫
> 更多的用法可以參考
> https://www.electronjs.org/docs/latest/api/context-bridge
第二段則是要給ipcMain呼叫的回傳方法，其中寫法與ipcMain一樣，不過主體換成ipcRenderer，
這邊接收到訊息後，需要將結果更新到index.html裏面，因此簡單用document去更新物件的innerHTML
```javascript!
// preload.js
// -----------------------------
const {ipcRenderer, contextBridge} = require('electron');

// send request to main with channel 'show open dialog'
contextBridge.exposeInMainWorld('dialogAPI', {
    openDialog(result) {
        // ipcMain中的
      ipcRenderer.send('show-open-dialog',result);
    }
  });

// receive request from main with channel 'oepn-dialog-reply' 
ipcRenderer.on('open-dialog-reply', (event, filePaths) => {
    document.querySelector('#isCancelledText').innerHTML = data.canceled;
    document.querySelector('#filepathsText').innerHTML = data.filePaths.join('\n');
});
```

### 新增按鈕的script與頁面顯示
按鈕的部分，在renderer.js中，利用document在頁面以相對應的ID找到button，並註冊一個click的event去呼叫preload提供的API方法
```javascript!
// renderer.js
// -----------------------------
document.querySelector('#btnOpen').addEventListener('click', () => {
    dialogAPI.openDialog();
});
```
> 在renderer當中，window == this
> 因此用window.dialogAPI.openDialog() 或
>      this.dialogAIP.openDialog() 或
>      dialogAPI.openDialog() 都可以呼叫到正確的方法

並且在index.html當中，新增前述會用到的一個Button以及兩套label與textarea
```htmlmixed!
<!--index.html-->
<body>
    <h1>Hello World!</h1>
    <br>
    <button id="btnOpen">Open File</button>
    <br>
    <label>Open File Cancelled?</label>
    <textarea id="isCancelledText"></textarea>
    <br>
    <label>Filepaths</label>
    <textarea id="filepathsText"></textarea>
    <script src="renderer.js"></script>
</body>
```

最後運行app測試open file可以發現，選擇檔案並點選打開之後，就可以看到openDialog狀態與檔案清單顯示在textarea中
![](https://hackmd.io/_uploads/rk6kB-cyj.png)



## 結論
~~學會使用electron，你/妳就可以寫一個自己的Chrome(X~~

* 寫桌面應用程式的(新)選擇
* 可以完整使用網頁開發套件的方便工具
* 可以使用地端硬體資源
* 跨平台的應用程式與發佈 (ex: windows installer)

以傳統軟體工程師(我)的角度：
1. 相比傳統應用程式的開發，electron架構好用又便宜
2. Lagacy程式可以透過plugin的包裝，移植到新的架構上，只需要重寫介面與API接口
3. 桌面應用程式未來可以“幾乎”無痛搬移到雲端上

以全端工程師(我)的角度：
1. 偶爾需要建立桌面應用程式的時候，不想要多學習一種語言
2. 雲端應用程式可以方便的搬移到地端
3. 更彈性的應用情境選擇(如HIS專案需要在本地端做一些事情)

* 延伸想法
透過IPC架構，可以實現不同renderer透過main的handler互相溝通
> ex: A renderer <--> main <--> B renderer

## Reference
[1]. OpenJS Foundation & Electron contributors, 2022, "Electron.js", https://www.electronjs.org/
[2]. Chandra, S. Sai, 2018, "What Is Electron and Why Should We Use it?", https://dzone.com/articles/what-is-electron-amp-why-should-we-use-it
[3]. Qt, 2022, "Qt wiki", https://wiki.qt.io/Main
[4]. OpenJS Foundation & Electron contributors, 2022, "Process Model", https://www.electronjs.org/docs/latest/tutorial/process-model
[5]. OpenJS Foundation & Electron contributors, 2022, "Inter-Process Communication", https://www.electronjs.org/docs/latest/tutorial/ipc
[6]. customcommander, 2021, "Electron — Open native dialog window from renderer", https://stackoverflow.com/questions/70057869/electron-open-native-dialog-window-from-renderer
[7]. Manngo, 2021, "How do I use showOpenDialog withe Electron’s IPC?", https://stackoverflow.com/questions/70331707/how-do-i-use-showopendialog-withe-electron-s-ipc
