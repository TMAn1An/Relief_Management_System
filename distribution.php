<?php
require_once 'config/db_connect.php';

$message = '';
$recipient = null;
$distributions = null;

if (isset($_POST['search'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    
    // Get recipient info
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
        
        // Get distribution history
        $sql = "SELECT * FROM Distributions WHERE nid = '$nid' ORDER BY date_time DESC";
        $distributions = $conn->query($sql);
    } else {
        $message = "No recipient found with this NID.";
    }
}

// AJAX handlers have been moved to ajax/add_distribution.php and ajax/delete_distribution.php
?>

<?php include 'includes/header.php'; ?>

<div class="form-container">
    <h2>Distribution Tracking</h2>
    
    <form action="" method="POST">
        <div class="form-group">
            <label for="nid">Enter NID Number</label>
            <input type="text" id="nid" name="nid" pattern="\d{10}" required>
        </div>
        <button type="submit" name="search" class="btn btn-primary">Search</button>
    </form>

    <?php if ($message): ?>
        <div class="alert <?php echo strpos($message, 'successfully') !== false ? 'alert-success' : 'alert-error'; ?>">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <?php if ($recipient): ?>
        <div class="recipient-info">
            <h3>Recipient Information</h3>
            <p><strong>Name:</strong> <?php echo $recipient['name']; ?></p>
            <p><strong>NID:</strong> <?php echo $recipient['nid']; ?></p>
            <p><strong>Status:</strong> <?php echo $recipient['status']; ?></p>
            
            <?php if ($recipient['status'] == 'Approved'): ?>
                <div class="distribution-section">
                    <form id="distributionForm" class="distribution-form">
                        <input type="hidden" name="nid" value="<?php echo $recipient['nid']; ?>">
                        <input type="hidden" name="distribution_id" id="distribution_id" value="">
                        <div class="form-group">
                            <label for="item_name">Item Name</label>
                            <select id="item_name" name="item_name" required>
                                <option value="">Select Item</option>
                                <option value="Rice">Rice</option>
                                <option value="Lentils">Lentils</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Oil">Oil</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="quantity">Quantity (kg/litre)</label>
                            <input type="number" id="quantity" name="quantity" step="0.1" min="0" required>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" id="addBtn" class="btn btn-primary">Add Distribution</button>
                            <button type="button" id="updateBtn" class="btn btn-success" style="display:none;">Update Distribution</button>
                            <button type="button" id="cancelBtn" class="btn btn-secondary" style="display:none;">Cancel</button>
                        </div>
                    </form>
                
                <h3>Distribution History</h3>
                <div class="table-responsive">
                    <table id="distributionTable" class="table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($distributions && $distributions->num_rows > 0): ?>
                                <?php while($row = $distributions->fetch_assoc()): ?>
                                <tr data-id="<?php echo $row['distribution_id']; ?>">
                                    <td><?php echo date('Y-m-d H:i:s', strtotime($row['date_time'])); ?></td>
                                    <td class="item-name"><?php echo $row['item_name']; ?></td>
                                    <td class="quantity"><?php echo $row['quantity']; ?></td>
                                    <td>
                                        <button type="button" class="btn btn-primary btn-sm edit-btn" data-id="<?php echo $row['distribution_id']; ?>">Edit</button>
                                        <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="<?php echo $row['distribution_id']; ?>" data-nid="<?php echo $recipient['nid']; ?>">Delete</button>
                                    </td>
                                </tr>
                                <?php endwhile; ?>
                            <?php else: ?>
                                <tr><td colspan="4">No distributions found.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="alert alert-error">
                    This recipient is not approved for distributions.
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const distributionForm = document.getElementById('distributionForm');
    const addBtn = document.getElementById('addBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const distributionId = document.getElementById('distribution_id');
    const distributionTable = document.getElementById('distributionTable');
    
    // Use event delegation for edit and delete buttons (robust with closest)
    distributionTable.addEventListener('click', function(e) {
        const editBtnEl = e.target.closest('.edit-btn');
        const deleteBtnEl = e.target.closest('.delete-btn');

        // Handle edit button clicks
        if (editBtnEl) {
            const row = editBtnEl.closest('tr');
            const id = row.dataset.id;
            const itemName = row.querySelector('.item-name').textContent;
            const quantity = row.querySelector('.quantity').textContent;

            // Fill form with data
            distributionId.value = id;
            document.getElementById('item_name').value = itemName;
            document.getElementById('quantity').value = quantity;

            // Show update and cancel buttons, hide add button
            addBtn.style.display = 'none';
            updateBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';

            // Scroll to form
            distributionForm.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Handle delete button clicks
        if (deleteBtnEl) {
            const id = deleteBtnEl.dataset.id;
            const nid = deleteBtnEl.dataset.nid;

            Swal.fire({
                title: 'Are you sure?',
                text: "This distribution record will be deleted permanently.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('distribution_id', id);
                    formData.append('nid', nid);

                    fetch('ajax/delete_distribution.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                'Distribution record has been deleted.',
                                'success'
                            ).then(() => {
                                // Remove the row from table
                                deleteBtnEl.closest('tr').remove();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                data.message || 'Error deleting distribution',
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire(
                            'Error!',
                            'An error occurred while deleting the distribution',
                            'error'
                        );
                    });
                }
            });
        }
    });
    
    // Add Distribution Form Submission (prevent duplicates and ensure single row add)
    let isSubmitting = false; // Flag to prevent multiple submissions
    distributionForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (isSubmitting) return; // avoid double submit
        isSubmitting = true;

        const addBtnEl = document.getElementById('addBtn');
        const originalText = addBtnEl.innerHTML;
        addBtnEl.disabled = true;
        addBtnEl.innerHTML = 'Adding...';

        const formData = new FormData(this);

        fetch('ajax/add_distribution.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (!data || !data.success) {
                throw new Error(data && data.message ? data.message : 'Error adding distribution');
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message,
                showConfirmButton: false,
                timer: 1200
            });

            // Add new row to table (always with Edit & Delete)
            const tbody = document.querySelector('#distributionTable tbody');
            const emptyRow = tbody.querySelector('td[colspan="4"]');
            if (emptyRow) emptyRow.parentElement.remove();

            const newRow = document.createElement('tr');
            newRow.dataset.id = data.distribution.distribution_id;
            newRow.innerHTML = `
                <td>${data.distribution.formatted_date}</td>
                <td class="item-name">${data.distribution.item_name}</td>
                <td class="quantity">${data.distribution.quantity}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm edit-btn" data-id="${data.distribution.distribution_id}">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${data.distribution.distribution_id}" data-nid="${data.distribution.nid}">Delete</button>
                </td>
            `;

            tbody.insertBefore(newRow, tbody.firstChild);

            // Reset form
            this.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while adding the distribution'
            });
        })
        .finally(() => {
            isSubmitting = false;
            addBtnEl.disabled = false;
            addBtnEl.innerHTML = originalText;
        });
    });
    
    // Cancel button click handler
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });
    
    // Update button click handler
    updateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const formData = new FormData(distributionForm);
        formData.append('action', 'update');
        
        fetch('ajax/edit_distribution.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Distribution updated successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Error updating distribution'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the distribution'
            });
        });
    });
    
    // Form reset function
    function resetForm() {
        distributionForm.reset();
        distributionId.value = '';
        addBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }
});
</script>

<?php include 'includes/footer.php'; ?>
