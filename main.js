const { app, ipcMain, dialog, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater');
const fs = require('fs')
const os = require('os')
const path = require('path')
const venom = require('venom-bot');

let clientVen = null;
let mainWindow = null

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js") // use a preload script
        }
    });

    if (isDev()) {
        mainWindow.loadURL('http://192.168.15.8:4200')

        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadURL('https://prime.alphavillesystems.com.br')
    }

    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 200);
}

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atualização',
        defaultId: 0,
        cancelId: 0,
        message: "Nova atualização, fazendo download para atualizar...",
        buttons: ['OK']
    })
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atualização',
        defaultId: 0,
        cancelId: 0,
        message: "Existe uma atualização disponível, clique em Atualizar",
        buttons: ['Atualizar']
    }, () => {
        setTimeout(() => {
            autoUpdater.quitAndInstall()
            app.quit()
        }, 100);
    })
});

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("refreshQRCode", (event) => {
    const userDataDir = app.getPath('appData')
    ven = null
    if (fs.existsSync(userDataDir)) {
        fs.rmSync(userDataDir, { recursive: true, force: true });
    }
    callConnect(event)
})

ipcMain.on("getQRCode", async (event) => {
    event.sender.send("checkConection", { status: 0, qrcode: null, msg: "Iniciando..." });
    if (clientVen && await clientVen.isConnected()) {
        event.sender.send("checkConection", { status: 2, qrcode: null, msg: "Conectado!" });
    } else {
        callConnect(event)
    }
})

ipcMain.on("sendMsg", async (event, data, base64) => {
    var filePath = ""
    try {
        filePath = app.getPath("temp") + "alpavilleerpzap.png"
        if (base64 && base64 !== "") {
            var binaryData = Buffer.from(base64, 'base64').toString('binary');
            fs.writeFileSync(filePath, binaryData, "binary");
        } else {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }
    } catch (error) {
        console.error(error);
    }

    var tel = data.tel
    var msg = data.msg
    if (clientVen && await clientVen.isConnected()) {
        if (tel.toString().length == 11) {
            try {
                if (base64 && base64 !== "") {
                    clientVen.sendText("55" + tel + '@c.us', msg)
                        .then((result) => {

                            clientVen.sendImage("55" + tel + '@c.us', filePath, "Imagem").then((result) => {
                                console.log("Enviou: " + tel + " - " + msg);
                                event.sender.send("receiveSendMsg", { sent: true, data: data });
                            }).catch(err => {
                                console.log("Não Enviou Error Catch: " + tel + " - " + msg);
                                event.sender.send("receiveSendMsg", { sent: false, data: data });
                            });

                        }).catch(err => {
                            console.log("Não Enviou Error Catch: " + tel + " - " + msg);
                            event.sender.send("receiveSendMsg", { sent: false, data: data });
                        });

                } else {
                    clientVen.sendText("55" + tel + '@c.us', msg)
                        .then((result) => {
                            console.log("Enviou: " + tel + " - " + msg);
                            event.sender.send("receiveSendMsg", { sent: true, data: data });
                        }).catch(err => {
                            console.log("Não Enviou Error Catch: " + tel + " - " + msg);
                            event.sender.send("receiveSendMsg", { sent: false, data: data });
                        });
                }

            } catch (error) {
                console.log("Não Enviou Error Try: " + tel + " - " + error);
                event.sender.send("receiveSendMsg", { sent: false, data: data });
            }
        } else {
            console.log("Não Enviou Tel Invalid: " + tel);
            event.sender.send("receiveSendMsg", { sent: false, data: data });
        }
    } else {
        event.sender.send("receiveSendMsg", { sent: false, data: null });
    }
})

ipcMain.on("getVersion", async (event) => {
    event.sender.send('receiveVersion', { version: app.getVersion() });
})

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atualização',
        defaultId: 0,
        cancelId: 0,
        message: "Nova atualização, fazendo download para atualizar...",
        buttons: ['OK']
    }, (index) => { })
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atualização',
        defaultId: 0,
        cancelId: 0,
        message: "Existe uma atualização disponível, clique em Atualizar",
        buttons: ['Atualizar']
    }, (index) => {
        if (index === 0) {
            setImmediate(() => {
                autoUpdater.quitAndInstall()
                app.quit()
            })
        }
    })
});

function callConnect(event) {
    const userDataDir = app.getPath('appData')
    venom.create({
        session: "company",
        multidevice: true,
        headless: true,
        folderNameToken: 'tokens',
        mkdirFolderToken: userDataDir
    },
        (base64Qrimg, asciiQR, attempts, urlCode) => {
            console.log('Number of attempts to read the qrcode: ', attempts);
            console.log('Terminal qrcode: ', asciiQR);
            console.log('base64 image string qrcode: ', base64Qrimg);
            console.log('urlCode (data-ref): ', urlCode);
            event.sender.send("checkConection", { status: 1, qrcode: urlCode, msg: "Leia o QRCode para conectar e aguarde a conexão. Tentativa: " + attempts });
        },

        (statusSession, session) => {
            console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            console.log('Session name: ', session);
            if (statusSession == "successChat") {
                event.sender.send("checkConection", { status: 2, qrcode: null, msg: "Conectado!" });
            } else {
                event.sender.send("checkConection", { status: 0, qrcode: null, msg: "Aguarde, conectando... Session: " + statusSession });
            }
        },

    ).then((client) => {
        clientVen = client
    }).catch((error) => {
        console.log(error);
        event.sender.send("checkConection", { status: 0, qrcode: null, msg: "Não foi possível conectar. Clique em atualizar o QRCode." + error });
    });
}

function isDev() {
    return process.argv[2] == '--dev';
}