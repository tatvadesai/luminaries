document.addEventListener('DOMContentLoaded', () => {
    const luminaryList = document.getElementById('luminary-list');
    const emptyState = document.getElementById('empty-state');
    const clearAllBtn = document.getElementById('clear-all-btn');

    function renderLuminaries() {
        chrome.storage.local.get({ luminaries: [] }, (result) => {
            const luminaries = result.luminaries;
            luminaryList.innerHTML = ''; // Clear existing list

            if (luminaries.length === 0) {
                emptyState.classList.remove('hidden');
                clearAllBtn.disabled = true;
            } else {
                emptyState.classList.add('hidden');
                clearAllBtn.disabled = false;
                luminaries.forEach((luminary, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span class="luminary-name">${luminary}</span>
                        <div class="luminary-actions">
                            <button class="copy-btn" data-luminary="${luminary}">Copy</button>
                            <button class="delete-btn" data-index="${index}">Delete</button>
                        </div>
                    `;
                    luminaryList.appendChild(listItem);
                });
            }
        });
    }

    // Initial render
    renderLuminaries();

    // Event listener for Copy and Delete buttons
    luminaryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const luminaryToCopy = event.target.dataset.luminary;
            navigator.clipboard.writeText(luminaryToCopy).then(() => {
                console.log('Luminary copied to clipboard:', luminaryToCopy);
                // Optional: Provide visual feedback for copy
            }).catch(err => {
                console.error('Failed to copy luminary:', err);
            });
        } else if (event.target.classList.contains('delete-btn')) {
            const indexToDelete = parseInt(event.target.dataset.index);
            chrome.storage.local.get({ luminaries: [] }, (result) => {
                const luminaries = result.luminaries;
                luminaries.splice(indexToDelete, 1); // Remove the item
                chrome.storage.local.set({ luminaries: luminaries }, () => {
                    renderLuminaries(); // Re-render the list
                });
            });
        }
    });

    // Event listener for Clear All button
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved luminaries?')) {
            chrome.storage.local.set({ luminaries: [] }, () => {
                renderLuminaries(); // Re-render to show empty state
            });
        }
    });

    // Event listener for Export to CSV button
    const exportCsvBtn = document.getElementById('export-csv-btn');
    exportCsvBtn.addEventListener('click', () => {
        chrome.storage.local.get({ luminaries: [] }, (result) => {
            const luminaries = result.luminaries;
            if (luminaries.length > 0) {
                const csvContent = "data:text/csv;charset=utf-8," + luminaries.map(name => `"${name.replace(/"/g, '""')}"`).join("\\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "luminaries.csv");
                document.body.appendChild(link); // Required for Firefox
                link.click();
                document.body.removeChild(link); // Clean up
            } else {
                alert("No luminaries to export!");
            }
        });
    });
});
