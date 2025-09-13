<?php
require_once 'config/db_connect.php';

$message = '';
$recipient = null;

if (isset($_POST['search'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
    } else {
        $message = "No recipient found with this NID.";
    }
}

if (isset($_POST['update_status'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    $status = $conn->real_escape_string($_POST['status']);
    
    $sql = "UPDATE Recipients SET status = '$status' WHERE nid = '$nid'";
    if ($conn->query($sql) === TRUE) {
        // If approved and no relief card exists, create one
        if ($status == 'Approved') {
            $checkCard = "SELECT * FROM ReliefCards WHERE nid = '$nid'";
            $cardResult = $conn->query($checkCard);
            
            if ($cardResult->num_rows == 0) {
                $createCard = "INSERT INTO ReliefCards (nid) VALUES ('$nid')";
                $conn->query($createCard);
            }
        }
        
        $message = "Status updated successfully!";
        
        // Refresh recipient data
        $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
        $result = $conn->query($sql);
        $recipient = $result->fetch_assoc();
    } else {
        $message = "Error updating status: " . $conn->error;
    }
}
?>

<?php include 'includes/header.php'; ?>

<div class="form-container">
    <h2>Approval Management</h2>
    
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
        <div class="info-card">
            <div class="recipient-header">
                <div class="recipient-photo">
                    <img src="<?php echo $recipient['photo']; ?>" alt="<?php echo $recipient['name']; ?>'s photo">
                </div>
                <div class="recipient-status <?php echo strtolower($recipient['status']); ?>">
                    <?php echo $recipient['status']; ?>
                </div>
            </div>
            
            <div class="recipient-details">
                <div class="info-group">
                    <h3><?php echo $recipient['name']; ?></h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>NID Number</label>
                            <span><?php echo $recipient['nid']; ?></span>
                        </div>
                        <div class="info-item">
                            <label>Phone</label>
                            <span><?php echo $recipient['phone']; ?></span>
                        </div>
                        <div class="info-item">
                            <label>Age</label>
                            <span><?php echo $recipient['age']; ?> years</span>
                        </div>
                        <div class="info-item">
                            <label>Category</label>
                            <span><?php echo $recipient['category']; ?></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <form action="" method="POST" class="status-form">
                <input type="hidden" name="nid" value="<?php echo $recipient['nid']; ?>">
                <div class="form-group">
                    <label for="status">Update Status</label>
                    <select id="status" name="status" required>
                        <option value="">Select Status</option>
                        <option value="Approved" <?php echo $recipient['status'] == 'Approved' ? 'selected' : ''; ?>>Approved</option>
                        <option value="Rejected" <?php echo $recipient['status'] == 'Rejected' ? 'selected' : ''; ?>>Rejected</option>
                        <option value="Pending" <?php echo $recipient['status'] == 'Pending' ? 'selected' : ''; ?>>Pending</option>
                    </select>
                </div>
                <button type="submit" name="update_status" class="btn btn-primary">Update Status</button>
            </form>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
