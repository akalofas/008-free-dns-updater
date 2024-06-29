const axios = require('axios');

// Update the Cloudflare DNS record with the new IP address
const updateDNSRecord = async (
	settings,
	wanIP,
	recordType,
	recordId,
	dnsRecord
) => {
	const zoneId = settings.zoneId;
	const apiToken = settings.apiToken;
	try {
		const response = await axios.put(
			`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
			{
				type: recordType,
				name: dnsRecord,
				content: wanIP,
				ttl: 120,
				proxied: false,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiToken}`,
				},
			}
		);
		return response.data.success;
	} catch (error) {
		console.error('Error updating DNS record:', error);
		return false;
	}
};

module.exports = {
	updateDNSRecord,
};
