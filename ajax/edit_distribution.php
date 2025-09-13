<?php
require_once '../config/db_connect.php';

header('Content-Type: application/json');
$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['distribution_id'])) {
    $distribution_id = $conn->real_escape_string($_POST['distribution_id']);
    $nid = $conn->real_escape_string($_POST['nid']);
    $item_name = $conn->real_escape_string($_POST['item_name']);
    $quantity = floatval($_POST['quantity']);
    
    // Validate inputs
    if (empty($distribution_id) || empty($nid) || empty($item_name) || $quantity <= 0) {
        $response['message'] = "Invalid input data.";
        echo json_encode($response);
        exit;
    }
    
    // Update the distribution record
    $sql = "UPDATE Distributions 
            SET item_name = ?, quantity = ?
            WHERE distribution_id = ? AND nid = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdis", $item_name, $quantity, $distribution_id, $nid);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Distribution updated successfully.";
    } else {
        $response['message'] = "Error updating distribution: " . $conn->error;
    }
    
    $stmt->close();
} else {
    $response['message'] = "Invalid request method or missing data.";
}

echo json_encode($response);
