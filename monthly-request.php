<?php
require_once 'config/db_connect.php';

$message = '';
$recipient = null;

if (isset($_POST['search'])) {
    $nid = $conn->real_escape_string($_POST['nid']);
    
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
        
        // Check if recipient has a request in the current month
        $currentDate = date('Y-m-d');
        $firstDayOfMonth = date('Y-m-01');
        
        $sql = "SELECT * FROM Requests 
                WHERE nid = '$nid' 
                AND request_date >= '$firstDayOfMonth'
                ORDER BY request_date DESC LIMIT 1";
        $requestResult = $conn->query($sql);
        
        if ($requestResult->num_rows > 0) {
            $request = $requestResult->fetch_assoc();
            $existingRequest = true;
            $lastRequestDate = new DateTime($request['request_date']);
            $nextRequestDate = $lastRequestDate->modify('first day of next month');
        }
    } else {
        $message = "No recipient found with this NID.";
    }
}
?>

<?php include 'includes/header.php'; ?>

<style>
.countdown-wrapper {
    background: linear-gradient(135deg, #2F4858, #1a73e8);
    color: white;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    text-align: center;
    margin: 1.5rem 0;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.countdown-title {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.countdown-display {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.countdown-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    min-width: 100px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.countdown-number {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-family: 'Montserrat', sans-serif;
    line-height: 1;
}

.countdown-label {
    font-size: 0.75rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
}

.next-date {
    font-size: 1rem;
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
    display: inline-block;
}

.next-date {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    display: inline-block;
    font-size: 0.9rem;
}

.request-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
}

.search-section {
    background: #fff;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.result-section {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.card-header {
    background: #2F4858;
    padding: 1.5rem 2rem;
    border-bottom: none;
    position: relative;
    border-radius: 15px 15px 0 0;
}

.card-header h2 {
    font-size: 1.8rem;
    font-weight: 500;
    margin: 0;
    letter-spacing: 0.5px;
}

.card-body {
    padding: 1rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    font-weight: 500;
    margin-bottom: 0.75rem;
    color: #2F4858;
    display: block;
    font-size: 1.1rem;
}

.form-control {
    border-radius: 8px;
    padding: 0.875rem 1rem;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    font-size: 1rem;
    height: auto;
    background: #ffffff;
    width: 100%;
}

.form-control:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    outline: none;
}

.form-control:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.btn {
    padding: 0.5rem 1.5rem;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    white-space: nowrap;
    display: inline-block;
    text-align: center;
    min-width: 120px;
}

.btn {
    padding: 0.875rem 2rem;
    font-weight: 500;
    border-radius: 8px;
    font-size: 1rem;
    min-width: 120px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: #1a73e8;
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(26, 115, 232, 0.3);
}

.btn-primary:hover {
    background: #1557b0;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
}

.btn-primary:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.badge {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 4px;
    display: inline-block;
    font-weight: 500;
}

.badge-success {
    background-color: #27ae60;
    color: white;
}

.badge-warning {
    background-color: #f1c40f;
    color: #2c3e50;
}

.recipient-info {
    margin-top: 1.5rem;
}

.recipient-header {
    padding: 2.5rem 2rem;
    background: #2F4858;
    border-radius: 12px;
    color: white;
    margin-bottom: 1.5rem;
}

.recipient-header h2 {
    margin: 0 0 2rem 0;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1.1;
}

.gradient-text {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    background: linear-gradient(45deg, #1a73e8, #34a853, #fbbc04, #ea4335);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: hue 10s infinite linear;
}

@keyframes hue {
    from {
        filter: hue-rotate(0deg);
    }
    to {
        filter: hue-rotate(360deg);
    }
}

.info-grid {
    display: flex;
    gap: 1rem;
    margin: 0;
    align-items: center;
}

.info-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem 1.25rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    flex: 1;
}

.info-item label {
    display: block;
    font-size: 0.75rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    font-size: 1rem;
    font-weight: 500;
    color: #fff;
}

.status-badge {
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-size: 0.9rem;
    display: inline-block;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 1px;
}

.status-badge.approved {
    background: #34a853;
    color: white;
}

.status-badge.pending {
    background: #fbbc04;
    color: #2F4858;
}

.status-badge.rejected {
    background: #ea4335;
    color: white;
}

.recipient-info table {
    width: 100%;
    border-collapse: collapse;
}

.recipient-info td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.recipient-info tr:last-child td {
    border-bottom: none;
}

.recipient-info td:first-child {
    font-weight: 600;
    color: #2c3e50;
    width: 120px;
    background: #f8fafc;
}

.recipient-info p span.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
}

.alert {
    border-radius: 6px;
    padding: 0.625rem 1rem;
    margin: 0.75rem 0;
    border: none;
    font-size: 0.9rem;
    line-height: 1.4;
}

#requestSection {
    margin-top: 1rem;
}

#requestSection .text-muted {
    font-size: 0.85rem;
    margin-top: 0.375rem;
    display: block;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
}

.alert-warning {
    background-color: #fff3cd;
    color: #856404;
}

.text-muted {
    color: #6c757d !important;
}
</style>

<div class="request-container">
    <div class="search-section">
        <h2 class="gradient-text">Monthly Relief Request</h2>
        <form id="searchForm" action="" method="POST">
            <div class="form-group">
                <label for="nid">Enter NID Number</label>
                <input type="text" id="nid" name="nid" class="form-control" pattern="\d{10}" required 
                       title="Please enter a valid 10-digit NID number">
            </div>
            <button type="submit" name="search" class="btn btn-primary" style="width: 100%;">Search</button>
        </form>

        <?php if ($message): ?>
            <div class="alert <?php echo strpos($message, 'successfully') !== false ? 'alert-success' : 'alert-danger'; ?>" 
                 style="margin-top: 1rem;">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
    </div>
    
    <div class="result-section">

            <?php if ($recipient): ?>
                <div class="recipient-info">
                    <div class="recipient-header">
                        <h2><?php echo strtoupper(htmlspecialchars($recipient['name'])); ?></h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>NID NUMBER</label>
                                <span><?php echo htmlspecialchars($recipient['nid']); ?></span>
                            </div>
                            <div class="info-item">
                                <label>CATEGORY</label>
                                <span><?php echo htmlspecialchars($recipient['category'] ?? 'General'); ?></span>
                            </div>
                            <div class="info-item">
                                <label>STATUS</label>
                                <span class="status-badge <?php echo strtolower($recipient['status']); ?>">
                                    <?php echo htmlspecialchars($recipient['status']); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <?php if ($recipient['status'] == 'Approved'): ?>
                        <?php if (isset($existingRequest)): ?>
                            <div class="countdown-wrapper">
                                <div class="countdown-title">Time Until Next Relief Request</div>
                                <div class="countdown-display" id="countdown">
                                    <div class="countdown-item">
                                        <div class="countdown-number" id="days">00</div>
                                        <div class="countdown-label">Days</div>
                                    </div>
                                    <div class="countdown-item">
                                        <div class="countdown-number" id="hours">00</div>
                                        <div class="countdown-label">Hours</div>
                                    </div>
                                    <div class="countdown-item">
                                        <div class="countdown-number" id="minutes">00</div>
                                        <div class="countdown-label">Minutes</div>
                                    </div>
                                    <div class="countdown-item">
                                        <div class="countdown-number" id="seconds">00</div>
                                        <div class="countdown-label">Seconds</div>
                                    </div>
                                </div>
                                <div class="next-date">
                                    Next Request Available: <?php echo date('F d, Y', strtotime('first day of next month')); ?>
                                </div>
                                <div style="margin-top: 1.5rem;">
                                    <?php if($recipient['status'] == 'Approved'): ?>
                                        
                                    <?php else: ?>
                                        <button class="btn btn-secondary" disabled title="Only approved recipients can print cards">
                                            Not Eligible - <?php echo $recipient['status']; ?>
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="text-center mt-4">
                                <button type="button" id="submitRequest" class="btn btn-primary btn-lg" 
                                        data-nid="<?php echo htmlspecialchars($recipient['nid']); ?>">
                                    Submit Relief Request
                                </button>
                                <?php if($recipient['status'] == 'Approved'): ?>
                                    
                                <?php else: ?>
                                    <button class="btn btn-secondary btn-lg" disabled style="margin-left: 1rem;" 
                                            title="Only approved recipients can print cards">
                                        Not Eligible
                                    </button>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <div class="alert alert-warning mt-3">
                            <strong>Note:</strong> Your status must be 'Approved' to submit a relief request.
                            Please contact the administrator for assistance.
                        </div>
                    <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Countdown Timer Function
    function updateCountdown() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const timeLeft = nextMonth - now;

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    // If countdown exists, start it
    if (document.getElementById('countdown')) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Submit Request Button Handler
    const submitBtn = document.getElementById('submitRequest');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const nid = this.getAttribute('data-nid');
            const formData = new FormData();
            formData.append('nid', nid);

            fetch('ajax/submit_request.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    }).then(() => {
                        // Disable the button and show message
                        submitBtn.disabled = true;
                        const message = document.createElement('small');
                        message.className = 'text-muted d-block mt-2';
                        message.textContent = 'You have already submitted a request this month.';
                        submitBtn.parentNode.appendChild(message);
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message,
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while processing your request',
                    icon: 'error'
                });
            });
        });
    }
});
</script>

<?php include 'includes/footer.php'; ?>
