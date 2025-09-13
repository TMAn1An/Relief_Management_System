<?php
require_once '../config/db_connect.php';

header('Content-Type: application/json');
$response = ['success' => false, 'data' => null, 'message' => ''];

// Get date range from request
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01', strtotime('-11 months'));
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-t');

try {
    // Get monthly statistics within date range
    $sql = "SELECT 
                mr.*,
                COUNT(DISTINCT r.nid) as unique_recipients,
                SUM(CASE WHEN rc.category = 'Elderly' THEN 1 ELSE 0 END) as elderly_count,
                SUM(CASE WHEN rc.category = 'Widow' THEN 1 ELSE 0 END) as widow_count,
                SUM(CASE WHEN rc.category = 'Disabled' THEN 1 ELSE 0 END) as disabled_count
            FROM MonthlyRequests mr
            LEFT JOIN Requests r ON DATE_FORMAT(r.request_date, '%Y') = mr.year 
                AND DATE_FORMAT(r.request_date, '%c') = mr.month
            LEFT JOIN Recipients rc ON r.nid = rc.nid
            WHERE CONCAT(mr.year, '-', LPAD(mr.month, 2, '0'), '-01') 
                BETWEEN ? AND LAST_DAY(?)
            GROUP BY mr.year, mr.month
            ORDER BY mr.year DESC, mr.month DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $stats = [];
    while ($row = $result->fetch_assoc()) {
        $monthYear = date('F Y', strtotime($row['year'] . '-' . $row['month'] . '-01'));
        $stats[] = [
            'month_year' => $monthYear,
            'total_requests' => $row['total_requests'],
            'unique_recipients' => $row['unique_recipients'],
            'categories' => [
                'elderly' => $row['elderly_count'],
                'widow' => $row['widow_count'],
                'disabled' => $row['disabled_count']
            ]
        ];
    }
    
    $response['success'] = true;
    $response['data'] = $stats;
    
} catch (Exception $e) {
    $response['message'] = "Error retrieving statistics.";
    error_log("Error in get_monthly_stats.php: " . $e->getMessage());
}

echo json_encode($response);
