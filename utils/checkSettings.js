const { loadSettings } = require('./config');

const checkSettings = () => {
	const settings = loadSettings();
	let response = {
		validCommon: true,
		validIPv4: settings.ipv4.enabled,
		validIPv6: settings.ipv6.enabled,
		checkedSettings: settings,
	};

	if (
		!settings.apiToken ||
		settings.apiToken.trim() === '' ||
		!settings.zoneId ||
		settings.zoneId.trim() === '' ||
		!settings.updateInterval ||
		settings.updateInterval.trim() === ''
	) {
		response.validCommon = false;
	}

	if (
		settings.ipv4.enabled &&
		(!settings.ipv4.dnsRecord ||
			settings.ipv4.dnsRecord.trim() === '' ||
			!settings.ipv4.recordId ||
			settings.ipv4.recordId.trim() === '')
	) {
		response.validIPv4 = false;
	}

	if (
		settings.ipv6.enabled &&
		(!settings.ipv6.dnsRecord ||
			settings.ipv6.dnsRecord.trim() === '' ||
			!settings.ipv6.recordId ||
			settings.ipv6.recordId.trim() === '')
	) {
		response.validIPv6 = false;
	}
	return response;
};

module.exports = { checkSettings };
