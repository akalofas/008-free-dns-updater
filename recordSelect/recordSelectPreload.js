const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	loadRecords: (callback) => ipcRenderer.on('load-records', callback),
	selectRecord: (record, recordType) =>
		ipcRenderer.send('select-record', record, recordType),
});
