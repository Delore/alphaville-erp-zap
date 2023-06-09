const { ipcRenderer, contextBridge } = require("electron");
contextBridge.exposeInMainWorld("ipcRenderer", {
    ipcRenderer,
    getQRCode: function () {
        ipcRenderer.send("getQRCode");
    },
    sendMsg: function (data, base64) {
        ipcRenderer.send("sendMsg", data, base64);
    },
    refreshQRCode: function () {
        ipcRenderer.send("refreshQRCode");
    },

    getVersion: function () {
        ipcRenderer.send("getVersion");
    },
    //
    // Receive
    //
    receive: function (func) {
        ipcRenderer.on("checkConection", (event, ...args) => func(event, ...args));
    },

    receiveSendMsg: function (func) {
        ipcRenderer.on("receiveSendMsg", (event, ...args) => func(event, ...args));
    },

    receiveVersion: function (func) {
        ipcRenderer.on("receiveVersion", (event, ...args) => func(event, ...args));
    }
});