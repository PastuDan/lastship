const { app, BrowserWindow, ipcMain } = require('electron')
const { channels } = require('../src/shared/constants')
const path = require('path')
const url = require('url')
const Nightmare = require('nightmare')
const { infinity } = require('check-types')

let mainWindow
function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true,
    })
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  mainWindow.loadURL(startUrl)
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on(channels.APP_INFO, event => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion(),
  })
})

ipcMain.on(channels.LOGIN, (event, payload) => {
  const nightmare = Nightmare({
    electronPath: require('../node_modules/electron'),
    show: true,
    typeInterval: 1,
  })

  // nightmare
  //   .goto(payload.url)
  //   .type('#email', 'dan2@hexial.com')
  //   .type('#pwd', 'mypassword')
  //   .click('#submitBtn')
  //   .wait('#ups-profileBtn')
  //   .evaluate(() => document.querySelector('#ups-profileBtn').text)
  //   .then(cookies => {
  //     console.log(cookies)
  //   })
  //   .catch(error => {
  //     console.error('Search failed:', error)
  //   })

  nightmare
    .goto('https://www.ups.com/ship/guided/origin')
    .type('#origin-cac_companyOrName', 'Daniel Pastusek')
    .click(
      '#ups-main > div.ups-form_wrap.ups-wrap.ups-application_wrapper.ups-app_nbs > app > ng-component > div > div > div > div > ng-component > section > origin > agent-wrapper > section > div:nth-child(2) > cac-agent > cac > cac-form > div > div.ng-star-inserted > button > span'
    )
    .type('#origin-cac_singleLineAddress', 'my address')
    // .click('#submitBtn')
    .wait('#ups-profileBtn')
    .evaluate(() => document.querySelector('#ups-profileBtn').text)
    .then(cookies => {
      console.log(cookies)
    })
    .catch(error => {
      console.error('Search failed:', error)
    })

  // event.sender.send(channels.LOGIN, {
  //   appName: app.getName(),
  //   appVersion: app.getVersion(),
  // })
})
