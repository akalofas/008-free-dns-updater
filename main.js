const { app, Menu, Tray, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { checkSettings } = require('./utils/checkSettings');
const { saveSettings } = require('./utils/config');
const { getCurrentDNSIP } = require('./utils/api/getCurrentDNSIP');
const { fetchDNSRecords } = require('./utils/api/fetchDNSRecords');
const { updateDNSRecord } = require('./utils/api/updateDNSRecord');
const { getIPv4only, getIPv6only } = require('./utils/getIPs');

let tray = null;
let settingsWindow = null;
let recordSelectWindow = null;
let lastUpdatedIPv4 = 'Never';
let currentIPIPv4 = 'Unknown';
let nextUpdateIPv4 = 'Unknown';
let lastUpdatedIPv6 = 'Never';
let currentIPIPv6 = 'Unknown';
let nextUpdateIPv6 = 'Unknown';
let settings = {};
let dataDNSRecordsIPv4 = [];
let dataDNSRecordsIPv6 = [];

// Initialize the application by loading settings and starting the update interval
const initializeApp = () => {
    const { validCommon, validIPv4, validIPv6, checkedSettings } = checkSettings();
	settings = checkedSettings;

    if (!validCommon) {
        openSettingsWithDNSRecordList();
        openSettingsWindow(true);
        return;
    }

    if (!validIPv4 || !validIPv6) {
        openSettingsWithDNSRecordList();
        openSettingsWindow(false);
        return;
    }

    checkIPAndUpdateDNS();
    setInterval(checkIPAndUpdateDNS, settings.updateInterval * 60000);
};

// Create the system tray icon and menu
const createTray = () => {
    try {
        const iconPath = path.join(__dirname, 'icon.png');
        tray = new Tray(iconPath);
        updateTrayMenu();
    } catch (error) {
        console.error('Error creating tray icon:', error);
    }
};

// Update the tray menu with the current IP addresses and update status
const updateTrayMenu = () => {
    const contextMenuTemplate = [];

    if (settings.ipv4 && settings.ipv4.enabled) {
        contextMenuTemplate.push(
            { label: 'IPv4:', enabled: false },
            { label: `DNS Record: ${settings.ipv4.dnsRecord}`, enabled: false },
            { label: `Current IP: ${currentIPIPv4}`, enabled: false },
            { label: `Last updated: ${lastUpdatedIPv4}`, enabled: false },
            { label: `Next update: ${nextUpdateIPv4}`, enabled: false },
            { type: 'separator' }
        );
    } else {
        contextMenuTemplate.push(
            { label: 'IPv4 is disabled', enabled: false },
            { type: 'separator' }
        );
    }

    if (settings.ipv6 && settings.ipv6.enabled) {
        contextMenuTemplate.push(
            { label: 'IPv6:', enabled: false },
            { label: `DNS Record: ${settings.ipv6.dnsRecord}`, enabled: false },
            { label: `Current IP: ${currentIPIPv6}`, enabled: false },
            { label: `Last updated: ${lastUpdatedIPv6}`, enabled: false },
            { label: `Next update: ${nextUpdateIPv6}`, enabled: false },
            { type: 'separator' }
        );
    } else {
        contextMenuTemplate.push(
            { label: 'IPv6 is disabled', enabled: false },
            { type: 'separator' }
        );
    }

    contextMenuTemplate.push(
        {
            label: 'Update Now',
            click: () => {
                checkIPAndUpdateDNS();
            },
        },
        {
            label: 'Settings',
            click: () => {
                openSettingsWithDNSRecordList();
                openSettingsWindow(false);
            },
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    );

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
    tray.setToolTip('DNS Updater');
    tray.setContextMenu(contextMenu);
};

// Check the current IP addresses and update the DNS records if necessary
const checkIPAndUpdateDNS = async () => {
    try {
        if (
            settings.ipv4.enabled &&
            settings.ipv4.dnsRecord &&
            settings.ipv4.recordId
        ) {
            await updateDNSRecordForType('A', 'IPv4');
        }
        if (
            settings.ipv6.enabled &&
            settings.ipv6.dnsRecord &&
            settings.ipv6.recordId
        ) {
            await updateDNSRecordForType('AAAA', 'IPv6');
        }
        updateTrayMenu();
    } catch (error) {
        console.error('Error:', error);
    }
};

// Update the DNS record for a given IP type
const updateDNSRecordForType = async (recordType, ipType) => {
    try {
        const wanIP = await getCurrentWANIP(recordType);
        const dnsIP = await getCurrentDNSIP(settings, recordType);

        if (wanIP !== dnsIP) {
            const success = await updateDNSRecord(
                settings,
                wanIP,
                recordType,
                settings[ipType.toLowerCase()].recordId,
                settings[ipType.toLowerCase()].dnsRecord
            );
            if (success) {
                console.log(`DNS ${ipType} record updated successfully.`);
                if (ipType === 'IPv4') {
                    currentIPIPv4 = wanIP;
                } else {
                    currentIPIPv6 = wanIP;
                }
            } else {
                console.log(`Failed to update DNS ${ipType} record.`);
            }
        } else {
            console.log(
                `IP for ${ipType} has not changed, no update required.`
            );
        }

        if (ipType === 'IPv4') {
            lastUpdatedIPv4 = new Date().toLocaleString();
            nextUpdateIPv4 = new Date(
                Date.now() + settings.updateInterval * 60000
            ).toLocaleString();
        } else {
            lastUpdatedIPv6 = new Date().toLocaleString();
            nextUpdateIPv6 = new Date(
                Date.now() + settings.updateInterval * 60000
            ).toLocaleString();
        }
    } catch (error) {
        console.error(`Error fetching current DNS ${ipType} IP:`, error);
    }
};

// Fetch the current WAN IP address for a given record type
const getCurrentWANIP = async (recordType) => {
    try {
        let response;
        if (recordType === 'A') {
            response = await getIPv4only();
            currentIPIPv4 = response;
        } else {
            response = await getIPv6only();
            currentIPIPv6 = response;
        }
        return response;
    } catch (error) {
        console.error(`Error fetching current WAN IP:`, error);
        return null;
    }
};

// Open the settings window
const openSettingsWindow = (hideTabs = false) => {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 435,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'settings', 'settingsPreload.js'),
        },
    });

    settingsWindow.loadFile(path.join(__dirname, 'settings', 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
 
    settingsWindow.webContents.on('did-finish-load', () => {
        if (hideTabs) {
            settingsWindow.webContents.send('hide-ip-tabs');
        } else {
            const maskedSettings = {
                ...settings,
                apiToken: '******',
                zoneId: '******',
                ipv4: {
                    ...settings.ipv4,
                    recordId: '******',
                },
                ipv6: {
                    ...settings.ipv6,
                    recordId: '******',
                },
            };
            settingsWindow.webContents.send('load-settings', maskedSettings);
        }
    });
};

// Open the DNS record selection window
const openRecordSelectWindow = (recordType) => {
    if (recordSelectWindow) {
        recordSelectWindow.focus();
        return;
    }

    recordSelectWindow = new BrowserWindow({
        width: 900,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'recordSelect', 'recordSelectPreload.js'),
        },
    });

    recordSelectWindow.loadFile(path.join(__dirname, 'recordSelect', 'recordSelect.html'));

    recordSelectWindow.on('closed', () => {
        recordSelectWindow = null;
    });

    recordSelectWindow.webContents.on('did-finish-load', () => {
        const records = recordType === 'A' ? dataDNSRecordsIPv4 : dataDNSRecordsIPv6;
        recordSelectWindow.webContents.send('load-records', records);
    });
};

const openSettingsWithDNSRecordList = () => {
    fetchDNSRecords(settings)
        .then((records) => {
            dataDNSRecordsIPv4 = records.ipv4
                .filter((record) => record.type === 'A')
                .map(({ id, name, type, content }) => ({
                    id,
                    name,
                    type,
                    content,
                }));
            dataDNSRecordsIPv6 = records.ipv6
                .filter((record) => record.type === 'AAAA')
                .map(({ id, name, type, content }) => ({
                    id,
                    name,
                    type,
                    content,
                }));
        });
}

// Handle IPC events for saving settings and selecting records
ipcMain.on('save-settings', async (event, newSettings) => {
    const settingsWithUpdatedRecord = {
        ...settings,
        ...Object.fromEntries(
            Object.entries(newSettings).filter(
                ([key, value]) => value !== '******' && value !== settings[key]
            )
        ),
        ipv4: {
            ...settings.ipv4,
            ...Object.fromEntries(
                Object.entries(newSettings.ipv4).filter(
                    ([key, value]) => value !== '******'
                )
            ),
        },
        ipv6: {
            ...settings.ipv6,
            ...Object.fromEntries(
                Object.entries(newSettings.ipv6).filter(
                    ([key, value]) => value !== '******'
                )
            ),
        },
    };
    saveSettings(settingsWithUpdatedRecord);
    settings = settingsWithUpdatedRecord;
    updateTrayMenu();
	if (settings.ipv4.enabled || settings.ipv6.enabled) {
		if (settingsWindow) settingsWindow.close();
	} else {
		settingsWindow.close();
		openSettingsWithDNSRecordList();
        openSettingsWindow(false);
	}

    await checkIPAndUpdateDNS();
});

ipcMain.on('open-record-select', (event, recordType) => {
    openSettingsWithDNSRecordList();
    openRecordSelectWindow(recordType);
});

ipcMain.on('select-record', (event, selectedRecord, recordType) => {
    if (recordType === 'A') {
        settings.ipv4.recordId = selectedRecord.dns_id;
        settings.ipv4.dnsRecord = selectedRecord.dns_name;
    } else {
        settings.ipv6.recordId = selectedRecord.dns_id;
        settings.ipv6.dnsRecord = selectedRecord.dns_name;
    }

    if (settingsWindow) {
        settingsWindow.webContents.send('update-record', selectedRecord, recordType);
    }
    if (recordSelectWindow) {
        recordSelectWindow.close();
    }
});

app.on('ready', () => {
    createTray();
    initializeApp();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
