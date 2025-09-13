<?php
require_once 'config/db_connect.php';

$sql = "SELECT r.*, rc.card_no 
        FROM Recipients r 
        LEFT JOIN ReliefCards rc ON r.nid = rc.nid";
$result = $conn->query($sql);
?>

<?php include 'includes/header.php'; ?>

<div class="table-container">
    <h2>Recipients List</h2>
    <input type="text" id="searchInput" onkeyup="filterTable(this, 'recipientsTable')" placeholder="Search for recipients...">
    
    <table id="recipientsTable">
        <thead>
            <tr>
                <th>Photo</th>
                <th>NID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php while($row = $result->fetch_assoc()): ?>
            <tr>
                <td>
                    <img src="<?php echo $row['photo']; ?>" alt="<?php echo $row['name']; ?>'s photo" class="recipient-photo">
                </td>
                <td><?php echo $row['nid']; ?></td>
                <td><?php echo $row['name']; ?></td>
                <td><?php echo $row['phone']; ?></td>
                <td><?php echo $row['age']; ?></td>
                <td><?php echo $row['category']; ?></td>
                <td><?php echo $row['status']; ?></td>
                <td>
                    <button onclick="window.location.href='edit_recipient.php?nid=<?php echo $row['nid']; ?>'" class="btn btn-primary">Update</button>
                    <button onclick="if(confirm('Are you sure?')) window.location.href='delete_recipient.php?nid=<?php echo $row['nid']; ?>'" class="btn btn-danger">Delete</button>
                    <?php if($row['status'] == 'Approved'): ?>
                        <a href="print-card.php?nid=<?php echo $row['nid']; ?>" class="btn btn-success" target="_blank">Print Card</a>
                    <?php else: ?>
                        <button class="btn btn-secondary" disabled title="Only approved recipients can print cards">
                            Not Eligible
                        </button>
                    <?php endif; ?>
                </td>
            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</div>

<!-- Hidden Relief Cards for Printing -->
<?php 
$result->data_seek(0);
while($row = $result->fetch_assoc()): 
    if($row['card_no']):
?>
<div id="card-<?php echo $row['nid']; ?>" style="display: none;">
    <div class="relief-card">
        <div class="card-header">
            <h2>Relief Card</h2>
            <p>Card No: <?php echo sprintf('%06d', $row['card_no']); ?></p>
        </div>
        <div class="card-body">
            <img src="<?php echo $row['photo']; ?>" alt="Recipient Photo">
            <div class="card-info">
                <p><strong>Name:</strong> <?php echo $row['name']; ?></p>
                <p><strong>NID:</strong> <?php echo $row['nid']; ?></p>
                <p><strong>Age:</strong> <?php echo $row['age']; ?></p>
                <p><strong>Category:</strong> <?php echo $row['category']; ?></p>
                <p><strong>Status:</strong> <?php echo $row['status']; ?></p>
            </div>
        </div>
    </div>
</div>
<?php endif; endwhile; ?>

<?php include 'includes/footer.php'; ?>
