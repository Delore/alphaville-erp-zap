const { ipcRenderer, contextBridge } = require("electron");
contextBridge.exposeInMainWorld("ipcRenderer", {
    ipcRenderer,
    getQRCode: function () {
        ipcRenderer.send("getQRCode");
    },
    sendMsg: function (data) {
        ipcRenderer.send("sendMsg", data);
    },
    refreshQRCode: function () {
        ipcRenderer.send("refreshQRCode");
    },

    getVersion: function () {
        ipcRenderer.send("getVersion");
    },

    callRestartApp: function () {
        ipcRenderer.send("callRestartApp");
    },

    // Receive

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