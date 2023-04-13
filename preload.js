const { ipcRenderer, contextBridge } = require("electron");
contextBridge.exposeInMainWorld("ipcRenderer", {
    ipcRenderer,
    send: function () {
        ipcRenderer.send("getQRCode");
    },
    refreshQRCode: function () {
        ipcRenderer.send("refreshQRCode");
    },

    receive: function (func) {
        ipcRenderer.on("checkConection", (event, ...args) => func(event, ...args));
    },

    receiveSendMsg: function (func) {
        ipcRenderer.on("receiveSendMsg", (event, ...args) => func(event, ...args));
    },

    getVersion: function () {
        ipcRenderer.send("getVersion");
    },

    receiveVersion: function (func) {
        ipcRenderer.on("receiveVersion", (event, ...args) => func(event, ...args));
    }
});