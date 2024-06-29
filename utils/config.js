const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Define the app name
const appName = 'dns-updater';

// Determine the settings directory based on the environment
const isDevelopment = process.env.NODE_ENV === 'dev';
const settingsDirectory = isDevelopment
	? path.resolve(__dirname)
	: path.join(app.getPath('userData'), appName);
const settingsPath = path.join(settingsDirectory, 'settings.json');

// Ensure the directory exists
if (!fs.existsSync(settingsDirectory)) {
	fs.mkdirSync(settingsDirectory, { recursive: true });
}

// Ensure the settings file exists
if (!fs.existsSync(settingsPath)) {
	fs.writeFileSync(settingsPath, JSON.stringify({}, null, 2));
}

const loadSettings = () => {
	try {
		const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
		return settings;
	} catch (error) {
		console.error('Error loading settings:', error);
		return {};
	}
};

const saveSettings = (settings) => {
	try {
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
	} catch (error) {
		console.error('Error saving settings:', error);
	}
};

module.exports = {
	loadSettings,
	saveSettings,
};
