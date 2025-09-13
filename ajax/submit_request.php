<?php
require_once '../config/db_connect.php';

header('Content-Type: application/json');
$response = ['success' => false, 'message' => ''];

if (isset($_POST['nid'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    
    // Check if recipient exists and is approved
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows === 0) {
        $response['message'] = "No recipient found with this NID.";
        echo json_encode($response);
        exit;
    }

    $recipient = $result->fetch_assoc();
    if ($recipient['status'] !== 'Approved') {
        $response['message'] = "Your status must be 'Approved' to submit a request.";
        echo json_encode($response);
        exit;
    }

    // Check if recipient has already requested this month using LAST_DAY to ensure month boundary
    $sql = "SELECT * FROM Requests 
            WHERE nid = '$nid' 
            AND request_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            AND request_date <= LAST_DAY(CURRENT_DATE)";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $request = $result->fetch_assoc();
        $requestDate = strtotime($request['request_date']);
        $nextRequestDate = strtotime('+30 days', $requestDate);
        $today = time();
        $daysRemaining = ceil(($nextRequestDate - $today) / (60 * 60 * 24));
        
        if ($daysRemaining > 0) {
            $response['message'] = "You have already submitted a request on " . date('F j, Y', $requestDate) . 
                      ". You can submit another request after " . $daysRemaining . " day" . ($daysRemaining > 1 ? "s" : "") . ".";
        } else {
            $response['message'] = "You can submit a new request now.";
        }
        echo json_encode($response);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert new request
        $sql = "INSERT INTO Requests (nid, request_date) VALUES ('$nid', NOW())";
        $conn->query($sql);
        
        // Update monthly statistics
        $year = date('Y');
        $month = date('n');
        
        // Try to update existing record first
        $updateSql = "INSERT INTO MonthlyRequests (year, month, total_requests) 
                      VALUES ($year, $month, 1)
                      ON DUPLICATE KEY UPDATE 
                      total_requests = total_requests + 1";
        $conn->query($updateSql);
        
        // Log the request
        $logSql = "INSERT INTO Logs (nid, action_type, details) 
                   VALUES ('$nid', 'REQUEST_SUBMITTED', 
                   'Monthly relief request submitted for " . date('F Y') . "')";
        $conn->query($logSql);
        
        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = "Your request has been submitted successfully! You will receive your relief package next month.";
        
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        $response['message'] = "Error submitting request. Please try again.";
        error_log("Error in submit_request.php: " . $e->getMessage());
    }
} else {
    $response['message'] = "Invalid request.";
}

echo json_encode($response);
