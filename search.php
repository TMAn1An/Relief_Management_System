<?php
require_once 'config/db_connect.php';

$recipient = null;
$message = '';

if (isset($_POST['search'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    
    $sql = "SELECT r.*, rc.card_no 
            FROM Recipients r 
            LEFT JOIN ReliefCards rc ON r.nid = rc.nid 
            WHERE r.nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
    } else {
        $message = "No recipient found with this NID.";
    }
}
?>

<?php include 'includes/header.php'; ?>

<div class="form-container">
    <h2>Search Recipient</h2>
    
    <form action="" method="POST">
        <div class="form-group">
            <label for="nid">Enter NID Number</label>
            <input type="text" id="nid" name="nid" pattern="\d{10}" required>
        </div>
        <button type="submit" name="search" class="btn btn-primary">Search</button>
    </form>

    <?php if ($message): ?>
        <div class="alert alert-error">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <?php if ($recipient): ?>
        <div class="search-result">
            <div class="recipient-preview-card">
                <div class="card-top">
                    <h2 class="recipient-name"><?php echo $recipient['name']; ?></h2>
                    <div class="card-meta">
                        <div class="card-number">Card No: <?php echo sprintf('%06d', $recipient['card_no']); ?></div>
                        <div class="status-badge <?php echo strtolower($recipient['status']); ?>">
                            <?php echo $recipient['status']; ?>
                        </div>
                    </div>
                </div>
                
                <div class="recipient-content">
                    <div class="recipient-photo">
                        <img src="<?php echo $recipient['photo']; ?>" alt="<?php echo $recipient['name']; ?>'s photo">
                    </div>
                    <div class="recipient-info">
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
            <?php if($recipient['card_no']): ?>
                <?php if($recipient['status'] == 'Approved'): ?>
                    <button onclick="printCard('recipientCard')" class="btn btn-primary">Print Card</button>
                <?php else: ?>
                    <button class="btn btn-secondary" disabled title="Only approved recipients can print cards">
                        Not Eligible - <?php echo $recipient['status']; ?>
                    </button>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>

<?php if ($recipient && $recipient['card_no']): ?>
<div id="recipientCard" style="display: none;">
    <div class="print-area">
        <div class="relief-card">
            <div class="card-header">
                <h1>Relief Management System</h1>
                <div class="card-number">#<?php echo sprintf('%06d', $recipient['card_no']); ?></div>
            </div>
            
            <div class="card-content">
                <div class="photo-section">
                    <img src="<?php echo $recipient['photo']; ?>" alt="Recipient Photo" class="recipient-photo">
                </div>
                
                <div class="details-section">
                    <div class="info-row">
                        <div class="label">Name</div>
                        <div class="separator">:</div>
                        <div class="value"><?php echo $recipient['name']; ?></div>
                    </div>
                    
                    <div class="info-row">
                        <div class="label">NID No</div>
                        <div class="separator">:</div>
                        <div class="value"><?php echo $recipient['nid']; ?></div>
                    </div>
                    
                    <div class="info-row">
                        <div class="label">Category</div>
                        <div class="separator">:</div>
                        <div class="value"><?php echo $recipient['category']; ?></div>
                    </div>
                    
                    <div class="info-row">
                        <div class="label">Status</div>
                        <div class="separator">:</div>
                        <div class="value">
                            <span class="status-pill <?php echo strtolower($recipient['status']); ?>">
                                <?php echo strtoupper($recipient['status']); ?>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="footer-item">
                    <span class="footer-label">Issued</span>
                    <span class="separator">:</span>
                    <span class="footer-value"><?php echo date('d-M-Y'); ?></span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Expires</span>
                    <span class="separator">:</span>
                    <span class="footer-value"><?php echo date('d-M-Y', strtotime('+1 year')); ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function printCard(elementId) {
    const printContent = document.getElementById(elementId);
    const originalDisplay = printContent.style.display;
    
    // Show the card
    printContent.style.display = 'block';
    
    // Print the card
    window.print();
    
    // Restore original display
    printContent.style.display = originalDisplay;
}
</script>
<?php endif; ?>

<?php include 'includes/footer.php'; ?>
