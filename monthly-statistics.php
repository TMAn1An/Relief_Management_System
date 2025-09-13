<?php
require_once 'config/db_connect.php';

// Get current month
$currentMonth = date('Y-m');

// Define standard relief package per person
$reliefPackage = [
    'Rice' => 5,    // 5 kg per person
    'Dal' => 2,     // 2 kg per person
    'Oil' => 2,     // 2 L per person
    'Salt' => 1     // 1 kg per person
];

// Get total requests
// Get total requests and list of recipients who requested
$sql = "SELECT COUNT(*) as total_requests
        FROM Requests req
        JOIN Recipients r ON req.nid = r.nid
        WHERE DATE_FORMAT(req.request_date, '%Y-%m') = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $currentMonth);
$stmt->execute();
$result = $stmt->get_result();
$stats = $result->fetch_assoc();

// Calculate total relief needed
$totalReliefNeeded = [];
foreach ($reliefPackage as $item => $quantity) {
    $totalReliefNeeded[$item] = $stats['total_requests'] * $quantity;
}

// Get list of recipients who requested
$sql = "SELECT 
            r.nid,
            r.name,
            r.phone,
            req.request_date
        FROM Requests req
        JOIN Recipients r ON req.nid = r.nid
        WHERE DATE_FORMAT(req.request_date, '%Y-%m') = ?
        ORDER BY req.request_date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $currentMonth);
$stmt->execute();
$recipients = $stmt->get_result();

?>

<?php include 'includes/header.php'; ?>

<style>
.stats-container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.stats-header {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-header h2 {
    margin: 0;
    font-size: 1.75rem;
}

.stats-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
}

.stats-table table {
    width: 100%;
    border-collapse: collapse;
}

.stats-table th,
.stats-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.stats-table th {
    background: #f8fafc;
    font-weight: 600;
    color: #2c3e50;
}

.stats-table tr:last-child td {
    border-bottom: none;
}

.total-row td {
    font-weight: 600;
    background-color: #f8fafc;
}

.date-selector {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    align-items: center;
}

.select-style {
    padding: 0.5rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    cursor: pointer;
}

.select-style option {
    background: #2c3e50;
    color: white;
}

.btn-view {
    padding: 0.5rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-view:hover {
    background: rgba(255, 255, 255, 0.2);
}

#statsLoading {
    text-align: center;
    padding: 2rem;
    display: none;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.summary-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
}

.summary-card h3 {
    color: #2c3e50;
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.summary-card .number {
    font-size: 2rem;
    font-weight: 600;
    color: #3498db;
}

.category-breakdown {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.category-item {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background: #f8fafc;
}
</style>

<div class="stats-container">
    <div class="stats-header">
        <h2>Monthly Relief Statistics</h2>
        <div class="date-selector">
            <select id="monthSelect" class="select-style">
                <?php
                for ($m = 1; $m <= 12; $m++) {
                    $month = date('F', mktime(0, 0, 0, $m, 1));
                    $selected = $m == date('n') ? 'selected' : '';
                    echo "<option value=\"$m\" $selected>$month</option>";
                }
                ?>
            </select>
            <select id="yearSelect" class="select-style">
                <?php
                $currentYear = date('Y');
                for ($y = $currentYear - 2; $y <= $currentYear; $y++) {
                    $selected = $y == $currentYear ? 'selected' : '';
                    echo "<option value=\"$y\" $selected>$y</option>";
                }
                ?>
            </select>
            <button onclick="loadStatistics()" class="btn-view">View Statistics</button>
        </div>
    </div>
    
    <div id="currentStats">

    <div class="stats-table">
        <table>
            <thead>
                <tr>
                    <th colspan="2">Summary</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Requests</td>
                    <td><?php echo number_format($stats['total_requests']); ?> Recipients</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="stats-table">
        <table>
            <thead>
                <tr>
                    <th colspan="3">Required Relief Items</th>
                </tr>
                <tr>
                    <th>Item</th>
                    <th>Per Person</th>
                    <th>Total Required</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($reliefPackage as $item => $perPerson): ?>
                <tr>
                    <td><?php echo htmlspecialchars($item); ?></td>
                    <td><?php echo $perPerson; ?> <?php echo ($item === 'Oil' ? 'L' : 'kg'); ?></td>
                    <td><?php echo number_format($totalReliefNeeded[$item]); ?> <?php echo ($item === 'Oil' ? 'L' : 'kg'); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <div class="stats-table">
        <table>
            <thead>
                <tr>
                    <th colspan="4">Recipients Who Requested Relief</th>
                </tr>
                <tr>
                    <th>Name</th>
                    <th>NID</th>
                    <th>Phone</th>
                    <th>Request Date</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = $recipients->fetch_assoc()): ?>
                <tr>
                    <td><?php echo htmlspecialchars($row['name']); ?></td>
                    <td><?php echo htmlspecialchars($row['nid']); ?></td>
                    <td><?php echo htmlspecialchars($row['phone']); ?></td>
                    <td><?php echo date('d M Y', strtotime($row['request_date'])); ?></td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
function loadStatistics() {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const currentStats = document.getElementById('currentStats');
    currentStats.innerHTML = '<div id="statsLoading">Loading statistics...</div>';
    document.getElementById('statsLoading').style.display = 'block';
    
    fetch(`ajax/get_monthly_stats.php?start_date=${startDate}&end_date=${endDate}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const stats = data.data[0];
                let html = `
                    <div class="summary-cards">
                        <div class="summary-card">
                            <h3>Total Requests</h3>
                            <div class="number">${stats.total_requests}</div>
                        </div>
                        <div class="summary-card">
                            <h3>Unique Recipients</h3>
                            <div class="number">${stats.unique_recipients}</div>
                            <div class="category-breakdown">
                                <span class="category-item">Elderly: ${stats.categories.elderly}</span>
                                <span class="category-item">Widow: ${stats.categories.widow}</span>
                                <span class="category-item">Disabled: ${stats.categories.disabled}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Calculate relief items needed
                const reliefPackage = {
                    'Rice': 5,
                    'Dal': 2,
                    'Oil': 2,
                    'Salt': 1
                };
                
                html += `
                    <div class="stats-table">
                        <table>
                            <thead>
                                <tr>
                                    <th colspan="3">Required Relief Items</th>
                                </tr>
                                <tr>
                                    <th>Item</th>
                                    <th>Per Person</th>
                                    <th>Total Required</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                for (const [item, perPerson] of Object.entries(reliefPackage)) {
                    const total = stats.total_requests * perPerson;
                    const unit = item === 'Oil' ? 'L' : 'kg';
                    html += `
                        <tr>
                            <td>${item}</td>
                            <td>${perPerson} ${unit}</td>
                            <td>${total.toLocaleString()} ${unit}</td>
                        </tr>
                    `;
                }
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
                
                currentStats.innerHTML = html;
            } else {
                currentStats.innerHTML = `
                    <div class="stats-table">
                        <div style="padding: 1rem; text-align: center;">
                            No statistics available for the selected month.
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            currentStats.innerHTML = `
                <div class="stats-table">
                    <div style="padding: 1rem; text-align: center; color: #e74c3c;">
                        Error loading statistics. Please try again.
                    </div>
                </div>
            `;
        });
}

// Load current month's statistics on page load
document.addEventListener('DOMContentLoaded', loadStatistics);
</script>

<?php include 'includes/footer.php'; ?>
