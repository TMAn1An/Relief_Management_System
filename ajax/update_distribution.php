<?php
require_once '../config/db_connect.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'distribution' => null];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['distribution_id'], $_POST['nid'], $_POST['item_name'], $_POST['quantity'])) {
        $distribution_id = intval($_POST['distribution_id']);
        $nid = $conn->real_escape_string($_POST['nid']);
        $item_name = $conn->real_escape_string($_POST['item_name']);
        $quantity = floatval($_POST['quantity']);
        
        // Verify this distribution belongs to the correct recipient
        $sql = "SELECT * FROM Distributions WHERE distribution_id = $distribution_id AND nid = '$nid'";
        $result = $conn->query($sql);
        
        if ($result->num_rows > 0) {
            $sql = "UPDATE Distributions SET 
                    item_name = '$item_name',
                    quantity = $quantity 
                    WHERE distribution_id = $distribution_id";
            
            if ($conn->query($sql) === TRUE) {
                $response['success'] = true;
                $response['message'] = 'Distribution updated successfully';
                $response['distribution'] = [
                    'distribution_id' => $distribution_id,
                    'nid' => $nid,
                    'item_name' => $item_name,
                    'quantity' => $quantity
                ];
            } else {
                $response['message'] = "Error updating distribution: " . $conn->error;
            }
        } else {
            $response['message'] = "Distribution not found or unauthorized";
        }
    } else {
        $response['message'] = "Missing required fields";
    }
} else {
    $response['message'] = "Invalid request method";
}

echo json_encode($response);
