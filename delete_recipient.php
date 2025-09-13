<?php
require_once 'config/db_connect.php';

if (isset($_GET['nid'])) {
    $nid = $conn->real_escape_string($_GET['nid']);
    
    // First, get the photo path to delete the file
    $sql = "SELECT photo FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $photo = $row['photo'];
        
        // Delete the recipient
        $sql = "DELETE FROM Recipients WHERE nid = '$nid'";
        
        if ($conn->query($sql) === TRUE) {
            // Delete the photo file if it exists
            if (file_exists($photo)) {
                unlink($photo);
            }
            
            header("Location: recipients.php?message=Recipient deleted successfully");
        } else {
            header("Location: recipients.php?error=Error deleting recipient: " . $conn->error);
        }
    } else {
        header("Location: recipients.php?error=Recipient not found");
    }
} else {
    header("Location: recipients.php?error=Invalid request");
}
?>
