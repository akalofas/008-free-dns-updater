const axios = require('axios');

// Fetch DNS records from Cloudflare API
const fetchDNSRecords = async (settings) => {
	try {
		const responseIPv4 = await axios.get(
			`https://api.cloudflare.com/client/v4/zones/${settings.zoneId}/dns_records`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.apiToken}`,
				},
			}
		);
		const recordsIPv4 = responseIPv4.data.result;

		const responseIPv6 = await axios.get(
			`https://api.cloudflare.com/client/v4/zones/${settings.zoneId}/dns_records`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.apiToken}`,
				},
			}
		);
		const recordsIPv6 = responseIPv6.data.result;

		return {
			ipv4: recordsIPv4,
			ipv6: recordsIPv6,
		};
	} catch (error) {
		console.error('Error fetching DNS records:', error);
		return {
			ipv4: [],
			ipv6: [],
		};
	}
};

module.exports = {
	fetchDNSRecords,
};
