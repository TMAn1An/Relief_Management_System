<?php
require_once 'config/db_connect.php';

$recipient = null;
$message = '';

if (isset($_GET['nid'])) {
    $nid = $conn->real_escape_string($_GET['nid']);
    
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
        
        // Check if recipient is approved for card printing
        if ($recipient['status'] !== 'Approved') {
            $message = "Access denied. Only approved recipients can print relief cards. Your current status: " . $recipient['status'];
            $recipient = null;
        }
    } else {
        $message = "No recipient found with this NID.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relief Card - <?php echo $recipient ? htmlspecialchars($recipient['name']) : 'Not Found'; ?></title>
    <style>
        @media print {
            body {
                margin: 0;
                padding: 20px;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .no-print {
                display: none;
            }
            .card-container {
                page-break-inside: avoid;
            }
        }

        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .card-container {
            width: 350px;
            height: 220px;
            background: linear-gradient(135deg, #2c3e50, #3498db);
            border-radius: 15px;
            padding: 20px;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            color: white;
            position: relative;
            overflow: hidden;
        }

        .card-header {
            text-align: center;
            margin-bottom: 20px;
        }

        .card-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .card-subtitle {
            font-size: 12px;
            opacity: 0.9;
            margin: 5px 0;
        }

        .recipient-details {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .recipient-photo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 3px solid rgba(255, 255, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: bold;
            flex-shrink: 0;
            overflow: hidden;
            position: relative;
        }

        .recipient-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }

        .recipient-photo .initial-letter {
            display: none;
        }

        .recipient-photo.no-image .initial-letter {
            display: block;
        }

        .recipient-info {
            flex: 1;
        }

        .recipient-name {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 10px 0;
            line-height: 1.2;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
        }

        .info-label {
            opacity: 0.8;
        }

        .info-value {
            font-weight: 500;
        }

        .status-badge {
            background: #27ae60;
            padding: 3px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-badge.pending {
            background: #f39c12;
        }

        .status-badge.rejected {
            background: #e74c3c;
        }

        .card-footer {
            position: absolute;
            bottom: 15px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            opacity: 0.7;
        }

        .card-pattern {
            position: absolute;
            top: -50px;
            right: -50px;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
        }

        .card-pattern::before {
            content: '';
            position: absolute;
            top: 30px;
            left: 30px;
            width: 90px;
            height: 90px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 50%;
        }

        .controls {
            text-align: center;
            margin: 30px 0;
        }

        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }

        .btn:hover {
            background: #2980b9;
        }

        .btn-secondary {
            background: #95a5a6;
        }

        .btn-secondary:hover {
            background: #7f8c8d;
        }

        .error-message {
            text-align: center;
            color: #e74c3c;
            font-size: 18px;
            margin: 50px;
        }

    /* Card Back Side Styles */
        .card-back {
            width: 350px;
            height: 220px;
            background: linear-gradient(135deg, #34495e, #2c3e50);
            border-radius: 15px;
            padding: 25px;
            margin: 20px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            color: white;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .instructions-header {
            flex: 0 0 auto;
            margin-bottom: 0;
        }

    .instructions-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #ecf0f1;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

    .return-info {
            background: rgba(255, 255, 255, 0.08);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 18px;
            border-left: 4px solid #3498db;
        }

    .return-text {
            font-size: 12px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #ecf0f1;
        }

        .office-address {
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            opacity: 0.9;
            font-style: italic;
        }
        
        /* Two-column layout beneath top instructions */
        .back-columns {
            display: flex;
            gap: 18px;
            flex: 1 1 auto;
            align-items: stretch;
        }
        .back-columns .col-left {
            flex: 0 0 56%;
        }
        .back-columns .col-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            padding-right: 4px;
        }

        .instructions-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .instructions-list li {
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
            opacity: 0.95;
            font-weight: 500;
        }

        .instructions-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
            font-size: 16px;
        }

        /* Signature block in right column */
        .signature-block {
            text-align: right;
        }
        .signature-name {
            font-family: 'Kaushan Script', cursive;
            font-size: 28px;
            color: #ecf0f1;
            margin: 0 0 4px 0;
            transform: rotate(-3deg);
            opacity: 0.95;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.4);
            font-weight: 400;
        }
        .signature-role {
            font-size: 10px;
            letter-spacing: 0.4px;
            opacity: 0.85;
            margin: 0;
        }

        @import url('https://fonts.googleapis.com/css2?family=Kaushan+Script:wght@400&display=swap');
        
        .digital-signature {
            font-family: 'Kaushan Script', cursive;
        }
    </style>
</head>
<body>
    <?php if ($message): ?>
        <div class="error-message"><?php echo $message; ?></div>
        <div class="controls no-print">
            <a href="recipients.php" class="btn btn-secondary">Back to Recipients</a>
        </div>
    <?php else: ?>
        <div class="card-container">
            <div class="card-pattern"></div>
            
            <div class="card-header">
                <h1 class="card-title">Relief Distribution Card</h1>
                <p class="card-subtitle">Government Relief Program</p>
            </div>
            
            <div class="recipient-details">
                <div class="recipient-photo <?php echo empty($recipient['photo']) || !file_exists($recipient['photo']) ? 'no-image' : ''; ?>">
                    <?php if (!empty($recipient['photo']) && file_exists($recipient['photo'])): ?>
                        <img src="<?php echo htmlspecialchars($recipient['photo']); ?>" 
                             alt="<?php echo htmlspecialchars($recipient['name']); ?>"
                             onerror="this.style.display='none'; this.parentElement.classList.add('no-image'); this.parentElement.querySelector('.initial-letter').style.display='block';">
                    <?php endif; ?>
                    <span class="initial-letter"><?php echo strtoupper(substr($recipient['name'], 0, 1)); ?></span>
                </div>
                
                <div class="recipient-info">
                    <h2 class="recipient-name"><?php echo htmlspecialchars($recipient['name']); ?></h2>
                    
                    <div class="info-row">
                        <span class="info-label">NID:</span>
                        <span class="info-value"><?php echo htmlspecialchars($recipient['nid']); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="status-badge <?php echo strtolower($recipient['status']); ?>">
                            <?php echo htmlspecialchars($recipient['status']); ?>
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Category:</span>
                        <span class="info-value"><?php echo htmlspecialchars($recipient['category'] ?? 'General'); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Issue Date:</span>
                        <span class="info-value"><?php echo date('d M Y'); ?></span>
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <p>Valid for monthly relief distribution | Keep this card safe</p>
            </div>
        </div>

        <!-- Card Back Side -->
        <div class="card-back">
            <div class="instructions-header">
                <h2 class="instructions-title">IMPORTANT INSTRUCTIONS</h2>
                <div class="return-info">
                    <p class="return-text">If this card is found, please return it to:</p>
                    <div class="office-address">
                        District Relief Office<br>
                        Dhaka, Bangladesh
                    </div>
                </div>
            </div>

            <div class="back-columns">
                <div class="col-left">
                    <ul class="instructions-list">
                        <li>Present this card during relief distribution</li>
                        <li>Keep this card in a safe place</li>
                    </ul>
                </div>
                <div class="col-right">
                    <div class="signature-block">
                        <p class="signature-name">Mainul</p>
                        <p class="signature-role">Executive Officer</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="controls no-print">
            <button onclick="window.print()" class="btn">Print Both Sides</button>
            <a href="recipients.php" class="btn btn-secondary">Back to Recipients</a>
        </div>
    <?php endif; ?>

    <script>
        // Auto-focus print dialog if print parameter is present
        if (window.location.search.includes('print=1')) {
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        }
    </script>
</body>
</html>
