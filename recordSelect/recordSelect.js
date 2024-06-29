window.electron.loadRecords((event, filteredRecords) => {
	const tableBody = document.getElementById('recordsTableBody');
	tableBody.innerHTML = '';

	if (!filteredRecords || filteredRecords.length === 0) {
		const row = document.createElement('tr');
		const messageCell = document.createElement('td');
		messageCell.colSpan = 5;
		messageCell.textContent = 'No records available';
		row.appendChild(messageCell);
		tableBody.appendChild(row);
		return;
	}

	filteredRecords.forEach((record) => {
		const row = document.createElement('tr');
		const radioCell = document.createElement('td');
		const idCell = document.createElement('td');
		const nameCell = document.createElement('td');
		const typeCell = document.createElement('td');
		const descriptionCell = document.createElement('td');

		const radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'recordId';
		radio.value = JSON.stringify({
			dns_id: record.id,
			dns_name: record.name,
			dns_type: record.type,
		});

		radioCell.appendChild(radio);
		idCell.textContent = record.id;
		nameCell.textContent = record.name;
		typeCell.textContent = record.type;
		descriptionCell.textContent = record.content;

		row.appendChild(radioCell);
		row.appendChild(idCell);
		row.appendChild(nameCell);
		row.appendChild(typeCell);
		row.appendChild(descriptionCell);

		tableBody.appendChild(row);
	});
});

const selectRecord = () => {
	const selectedRecord = document.querySelector(
		'input[name="recordId"]:checked'
	);
	if (selectedRecord) {
		const record = JSON.parse(selectedRecord.value);
		const recordType = record.dns_type.includes('AAAA') ? 'AAAA' : 'A';
		window.electron.selectRecord(record, recordType);
	}
};

const cancelSelection = () => {
	window.close();
};
