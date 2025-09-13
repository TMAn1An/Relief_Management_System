<?php
session_start(); // Start session to track submissions
require_once '../config/db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Prevent rapid submissions (within 1 second instead of 2)
    $current_time = time();
    if (isset($_SESSION['last_submission']) && ($current_time - $_SESSION['last_submission']) < 1) {
        echo json_encode([
            // 'success' => true,
            // 'message' => 'Distribution added successfully!',
            // 'distribution' => $distribution
            'success' => false,
            'message' => 'Added Again Successfully after deleting!'
        ]);
        exit;
    }
    
    $nid = $conn->real_escape_string($_POST['nid']);
    $item_name = $conn->real_escape_string($_POST['item_name']);
    $quantity = floatval($_POST['quantity']);
    
    // Check if the same NID has already received the same item in the current month
    // Only check existing records (non-deleted items)
    $currentMonth = date('Y-m');
    $duplicateCheck = "SELECT distribution_id, date_time FROM Distributions 
                      WHERE nid = '$nid' 
                      AND TRIM(LOWER(item_name)) = TRIM(LOWER('$item_name'))
                      AND DATE_FORMAT(date_time, '%Y-%m') = '$currentMonth' 
                      ORDER BY date_time DESC
                      LIMIT 1";
    
    $duplicateResult = $conn->query($duplicateCheck);
    
    if ($duplicateResult && $duplicateResult->num_rows > 0) {
        $existing = $duplicateResult->fetch_assoc();
        echo json_encode([
            'success' => false,
            'message' => "This recipient has already received '" . ucfirst($item_name) . "' this month on " . date('M d, Y', strtotime($existing['date_time'])) . ". Same item can be distributed again next month."
        ]);
        exit;
    }
    
    $sql = "INSERT INTO Distributions (nid, item_name, quantity) VALUES ('$nid', '$item_name', $quantity)";
    
    if ($conn->query($sql) === TRUE) {
        // Record submission time to prevent rapid submissions
        $_SESSION['last_submission'] = time();
        
        // Get the newly inserted distribution with formatted date
        $distribution_id = $conn->insert_id;
        $sql = "SELECT *, DATE_FORMAT(date_time, '%Y-%m-%d %H:%i:%s') as formatted_date 
                FROM Distributions 
                WHERE distribution_id = $distribution_id";
        $result = $conn->query($sql);
        $distribution = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Distribution added successfully!',
            'distribution' => $distribution
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => "Error adding distribution: " . $conn->error
        ]);
    }
}
