const apiTokenInput = document.getElementById('apiToken');
const zoneIdInput = document.getElementById('zoneId');
const updateIntervalInput = document.getElementById('updateInterval');

const ipv4Tab = document.getElementById('IPv4__Btn');
const enableIPv4Checkbox = document.getElementById('enableIPv4');
const hiddenIPv4FieldDNS = document.getElementById('ipv4__hidden-dns');
const hiddenIPv4FieldRecord = document.getElementById('ipv4__hidden-record');
const dnsRecordInputIPv4 = document.getElementById('dnsRecordIPv4');
const recordIdInputIPv4 = document.getElementById('recordIdIPv4');
const getRecordsButtonIPv4 = document.getElementById('getRecordsButtonIPv4');

const ipv6Tab = document.getElementById('IPv6__Btn');
const enableIPv6Checkbox = document.getElementById('enableIPv6');
const hiddenIPv6FieldDNS = document.getElementById('ipv6__hidden-dns');
const hiddenIPv6FieldRecord = document.getElementById('ipv6__hidden-record');
const dnsRecordInputIPv6 = document.getElementById('dnsRecordIPv6');
const recordIdInputIPv6 = document.getElementById('recordIdIPv6');
const getRecordsButtonIPv6 = document.getElementById('getRecordsButtonIPv6');

const saveBtn = document.getElementById('saveButton');
const cancelBtn = document.getElementById('cancelButton');

// To store the current settings needed for the comparison of new changes at saveBtn
let currentSettings = {};

window.electron.loadSettings((event, maskedSettings) => {
	console.log('maskedset');
	apiTokenInput.value = maskedSettings.apiToken;
	zoneIdInput.value = maskedSettings.zoneId;
	updateIntervalInput.value = maskedSettings.updateInterval;

	enableIPv4Checkbox.checked = maskedSettings.ipv4.enabled;
	(enableIPv4Checkbox.checked) ? ShowHideIPv4(true) : ShowHideIPv4(false);
	dnsRecordInputIPv4.value = maskedSettings.ipv4.dnsRecord;
	recordIdInputIPv4.value = maskedSettings.ipv4.recordId;

	enableIPv6Checkbox.checked = maskedSettings.ipv6.enabled;
	(enableIPv6Checkbox.checked) ? ShowHideIPv6(true) : ShowHideIPv6(false);
	dnsRecordInputIPv6.value = maskedSettings.ipv6.dnsRecord;
	recordIdInputIPv6.value = maskedSettings.ipv6.recordId;

	// Store the current settings
	currentSettings = maskedSettings;
});

window.electron.updateRecord((event, record, recordType) => {
	if (recordType === 'A') {
		recordIdInputIPv4.value = record.dns_id;
		dnsRecordInputIPv4.value = record.dns_name;
	} else {
		recordIdInputIPv6.value = record.dns_id;
		dnsRecordInputIPv6.value = record.dns_name;
	}
});

window.electron.hideIpTabs((event) => {
	console.log('hideIpTabs true');
	ipv4Tab.setAttribute('hidden', '');
	ipv6Tab.setAttribute('hidden', '');
	cancelBtn.setAttribute('hidden', '');
	loadDefaultSettings();
})

enableIPv4Checkbox.addEventListener('click', (e) => {
	(enableIPv4Checkbox.checked) ? ShowHideIPv4(true) : ShowHideIPv4(false);
});

function ShowHideIPv4(show = true) {
	if (show) {
		hiddenIPv4FieldDNS.removeAttribute('hidden');
		hiddenIPv4FieldRecord.removeAttribute('hidden');
	} else {
		hiddenIPv4FieldDNS.setAttribute('hidden', '');
		hiddenIPv4FieldRecord.setAttribute('hidden', '');
	}
}

enableIPv6Checkbox.addEventListener('click', () => {
	(enableIPv6Checkbox.checked) ? ShowHideIPv6(true) : ShowHideIPv6(false);
});

function ShowHideIPv6(show = true) {
	if (show) {
		hiddenIPv6FieldDNS.removeAttribute('hidden');
		hiddenIPv6FieldRecord.removeAttribute('hidden');
	} else {
		hiddenIPv6FieldDNS.setAttribute('hidden', '');
		hiddenIPv6FieldRecord.setAttribute('hidden', '');
	}
}

saveBtn.addEventListener('click', () => {
	if (
		apiTokenInput.value === 'Your API Token Here' ||
		zoneIdInput.value === 'Your Zone ID Here'
	) {
		alert('API Token and Zone ID are required.');
		return;
	}

	if (updateIntervalInput.value === '') {
		alert('Update interval must be a number.');
		updateIntervalInput.value = currentSettings.updateInterval;
		return;
	}

	const ipv4Enabled = enableIPv4Checkbox.checked;
	const ipv6Enabled = enableIPv6Checkbox.checked;
	let newSettings = {};

	newSettings.apiToken =
		apiTokenInput.value !== '******'
			? apiTokenInput.value
			: currentSettings.apiToken;
	newSettings.zoneId =
		zoneIdInput.value !== '******'
			? zoneIdInput.value
			: currentSettings.zoneId;
	newSettings.updateInterval =
		updateIntervalInput.value !== '******'
			? updateIntervalInput.value
			: currentSettings.updateInterval;

	if (ipv4Enabled) {
		if (!dnsRecordInputIPv4.value || !recordIdInputIPv4.value) {
			alert('IPv4 is enabled but DNS Record and Record ID are not set.');
			return;
		} else {
			newSettings.ipv4 = {
				enabled: ipv4Enabled,
				dnsRecord: dnsRecordInputIPv4.value,
				recordId:
					recordIdInputIPv4.value !== '******'
						? recordIdInputIPv4.value
						: currentSettings.ipv4.recordId,
			};
		}
	} else {
		newSettings.ipv4 = {
			enabled: false,
			dnsRecord: '',
			recordId: '',
		};
	}

	if (ipv6Enabled) {
		if (!dnsRecordInputIPv6.value || !recordIdInputIPv6.value) {
			alert('IPv6 is enabled but DNS Record and Record ID are not set.');
			return;
		} else {
			newSettings.ipv6 = {
				enabled: ipv6Enabled,
				dnsRecord: dnsRecordInputIPv6.value,
				recordId:
					recordIdInputIPv6.value !== '******'
						? recordIdInputIPv6.value
						: currentSettings.ipv6.recordId,
			};
		}
	} else {
		newSettings.ipv6 = {
			enabled: false,
			dnsRecord: '',
			recordId: '',
		};
	}

	window.electron.saveSettings(newSettings);
});

getRecordsButtonIPv4.addEventListener('click', () => {
	window.electron.openRecordSelect('A');
});

getRecordsButtonIPv6.addEventListener('click', () => {
	window.electron.openRecordSelect('AAAA');
});

cancelBtn.addEventListener('click', () => {
	window.close();
});

function openTab(evt, tabName) {
	const tabcontent = document.getElementsByClassName('tabcontent');
	for (let i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}

	const tablinks = document.getElementsByClassName('tablink');
	for (let i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	}

	document.getElementById(tabName).style.display = 'block';
	evt.currentTarget.className += ' active';
}

// Default open tab
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('defaultOpen').click();
});

const checkCommonSettings = (setCommon = false) => {
	if (setCommon) {
		console.log('setCommon true');
		ipv4Tab.setAttribute('hidden', '');
		ipv6Tab.setAttribute('hidden', '');
		cancelBtn.setAttribute('hidden', '');
		loadDefaultSettings();
	} else {
		console.log('setCommon false');
		ipv4Tab.removeAttribute('hidden');
		ipv6Tab.removeAttribute('hidden');
		cancelBtn.removeAttribute('hidden');
	}
};

const loadDefaultSettings = () => {
	currentSettings = {
		apiToken: 'Your API Token Here',
		zoneId: 'Your Zone ID Here',
		updateInterval: 60,
		ipv4: {
			enabled: false,
			dnsRecord: '',
			recordId: '',
		},
		ipv6: {
			enabled: false,
			dnsRecord: '',
			recordId: '',
		},
	};
	apiTokenInput.value = currentSettings.apiToken;
	zoneIdInput.value = currentSettings.zoneId;
	updateIntervalInput.value = currentSettings.updateInterval;
};
