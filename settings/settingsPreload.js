const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	loadSettings: (callback) => ipcRenderer.on('load-settings', callback),
	saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
	openRecordSelect: (recordType) => ipcRenderer.send('open-record-select', recordType),
	updateRecord: (callback) => ipcRenderer.on('update-record', callback),
	hideIpTabs: (callback) => ipcRenderer.on('hide-ip-tabs', callback),
});
