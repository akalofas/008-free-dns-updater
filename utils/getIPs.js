const axios = require('axios');

// Fetch the current IPv4 address
// Validates that the IPv4 address is valid and if not retries 3 times
// For ipv4 addresses 3 retries are enough to avoid any network issues
const getIPv4only = async (retries = 3) => {
	try {
		const ipResponse = await axios.get('https://api.ipify.org?format=text');
		const ip = ipResponse.data.trim();
		if (validateIPv4(ip)) {
			return ip;
		} else {
			throw new Error('Invalid IPv4 address');
		}
	} catch (error) {
		console.error(`Error fetching IPv4 address: ${error.message}`);
		if (retries > 0) {
			return getIPv4only(retries - 1);
		} else {
			throw error;
		}
	}
};

// Fetch the current IPv6 address
// Validates that the IPv6 address is valid and if not retries
// For ipv6 addresses we implement delay of 2 seconds and retries 10 times 
// till a proper ip is available
const getIPv6only = async (retries = 10) => {
	try {
		const ipResponse = await axios.get('https://ipv6.icanhazip.com', {
			headers: { Accept: 'application/json' },
			timeout: 2000,
		});
		const ip = ipResponse.data.trim();
		if (validateIPv6(ip)) {
			return ip;
		} else {
			throw new Error('Invalid IPv6 address');
		}
	} catch (error) {
		console.error(`Error fetching IPv6 address: ${error.message}`);
		if (retries > 0) {
			await delay(2000);
			return getIPv6only(retries - 1);
		} else {
			throw error;
		}
	}
};

// Utility function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Validate if the IP is a valid IPv4 address
const validateIPv4 = (ip) => {
	const ipv4Regex =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipv4Regex.test(ip);
};

// Validate if the IP is a valid IPv6 address
const validateIPv6 = (ip) => {
	const ipv6Regex = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
	return ipv6Regex.test(ip);
};

module.exports = {
	getIPv4only,
	getIPv6only,
};
