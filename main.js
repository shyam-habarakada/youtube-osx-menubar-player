const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  session
} = require('electron')

const path = require('path')
const url = require('url')
const sessionName = 'persist:youtube-menubar-app'

// let mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25'
let mobileUserAgent = 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'

let tray = undefined
let win = undefined

function createWindow () {
  let menubarIcon = nativeImage.createFromPath(__dirname + '/images/menubarTemplate.png')
  let appIcon = nativeImage.createFromPath(__dirname + '/images/icon.png')

  tray = new Tray(menubarIcon)

  tray.on('click', function(event) {
    toggleWindow()

    if (win.isVisible() && process.defaultApp && event.metaKey) {
      win.openDevTools({mode: 'detach'})
    }
  })

  win = new BrowserWindow({
    width: 375,
    height: 667,
    show: false,
    frame: false,
    icon: appIcon,
    resizable: false,
    transparent: true,
    vibrancy: 'titlebar',
    scrollBounce: true,
    webPreferences: {
      nodeIntegration: false,
      zoomFactor: 1.0,
      partition: sessionName
    }
  })

  win.setAlwaysOnTop(false)

  session.fromPartition(sessionName).webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = mobileUserAgent;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  win.loadURL(`https://m.youtube.com`)

  win.on('blur', () => {
    if (win.isVisible()) {
      win.hide()
    }
  })

  win.on('closed', () => {
    // if(!win.webContents.isDevToolsOpened()) {
    //   win.hide()
    // }
    win = null
  })
}

const toggleWindow = () => {
  if (win.isVisible()) {
    win.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const windowPos = win.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  win.setPosition(x, y + 2, true)
  win.show()
  win.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // if (win === null) {
  //   createWindow()
  // }
})
