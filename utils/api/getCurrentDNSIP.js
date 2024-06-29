const axios = require('axios');

// Fetch the current DNS IP address for a given record type from Cloudflare
const getCurrentDNSIP = async (settings, recordType) => {
	const dnsRecord =
		recordType === 'A' ? settings.ipv4.dnsRecord : settings.ipv6.dnsRecord;
	try {
		const response = await axios.get(
			`https://api.cloudflare.com/client/v4/zones/${settings.zoneId}/dns_records`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.apiToken}`,
				},
				params: {
					type: recordType,
					name: dnsRecord,
				},
			}
		);

		if (response.data.success && response.data.result.length > 0) {
			const record = response.data.result.find(
				(record) => record.type === recordType
			);
			return record ? record.content : null;
		} else {
			console.error(
				'No records found or an error occurred:',
				response.data.errors
			);
			return null;
		}
	} catch (error) {
		console.error('Error fetching current DNS IP:', error);
		return null;
	}
};

module.exports = {
	getCurrentDNSIP,
};
