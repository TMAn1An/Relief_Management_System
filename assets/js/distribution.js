document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('distributionForm');

    if (form) {
        // Add Distribution
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const submitBtn = form.querySelector('button[type="submit"]');
            const isEditing = submitBtn.textContent.trim() === 'Update Distribution';
            const distributionId = form.querySelector('input[name="distribution_id"]')?.value;

            const url = isEditing 
                ? '/Relief/ajax/update_distribution.php'
                : '/Relief/ajax/add_distribution.php';

            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: isEditing ? 'Distribution updated successfully' : 'Distribution added successfully',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Clear form and reset button
                    form.reset();
                    if (isEditing) {
                        submitBtn.textContent = 'Add Distribution';
                        form.querySelector('input[name="distribution_id"]')?.remove();
                    }

                    // Update or add row in table
                    const tbody = document.querySelector('#distributionTable tbody');
                    if (tbody.querySelector('td[colspan="4"]')) {
                        tbody.innerHTML = ''; // Remove "No distributions found" message
                    }

                    const tr = document.createElement('tr');
                    tr.setAttribute('data-id', data.distribution.distribution_id);
                    tr.innerHTML = `
                        <td>${data.distribution.formatted_date || data.distribution.date_time}</td>
                        <td class="item-name">${data.distribution.item_name}</td>
                        <td class="quantity">${data.distribution.quantity}</td>
                        <td>
                            <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${data.distribution.distribution_id}" data-nid="${data.distribution.nid}">Delete</button>
                        </td>
                    `;

                    if (isEditing) {
                        const oldRow = tbody.querySelector(`tr[data-id="${distributionId}"]`);
                        if (oldRow) {
                            tbody.replaceChild(tr, oldRow);
                        }
                    } else {
                        tbody.insertBefore(tr, tbody.firstChild);
                    }
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || 'An error occurred',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while processing your request',
                    icon: 'error'
                });
            });

            return false;
        });
    }

    // Delete Distribution
    document.addEventListener('click', function(e) {
        if (e.target.matches('.delete-btn')) {
            const distributionId = e.target.getAttribute('data-id');
            const nid = e.target.getAttribute('data-nid');
            deleteDistribution(distributionId, nid);
        }
    });
});

function deleteDistribution(distributionId, nid) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This distribution record will be permanently deleted',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('distribution_id', distributionId);
            formData.append('nid', nid);

            fetch('ajax/delete_distribution.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Distribution record has been deleted',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Remove row from table
                    const row = document.querySelector(`tr[data-id="${distributionId}"]`);
                    row.remove();

                    // If no more rows, show "No distributions found" message
                    const tbody = document.querySelector('#distributionTable tbody');
                    if (!tbody.hasChildNodes()) {
                        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No distributions found</td></tr>';
                    }
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || 'An error occurred while deleting',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while processing your request',
                    icon: 'error'
                });
            });
        }
    });
}
