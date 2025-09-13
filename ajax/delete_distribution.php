<?php
require_once '../config/db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $distribution_id = intval($_POST['distribution_id']);
    
    $sql = "DELETE FROM Distributions WHERE distribution_id = $distribution_id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            'success' => true,
            'message' => 'Distribution deleted successfully!'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => "Error deleting distribution: " . $conn->error
        ]);
    }
}
