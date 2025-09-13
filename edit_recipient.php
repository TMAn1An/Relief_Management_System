<?php
require_once 'config/db_connect.php';

$message = '';
$recipient = null;

if (isset($_GET['nid'])) {
    $nid_param = $conn->real_escape_string($_GET['nid']);
    
    $sql = "SELECT * FROM Recipients WHERE nid = '$nid_param'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $recipient = $result->fetch_assoc();
        $original_nid = $recipient['nid']; // Store the original NID for later use
    } else {
        header("Location: recipients.php?error=Recipient not found");
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if we have a valid original_nid
    if (!isset($original_nid)) {
        $errors[] = "Invalid recipient data. Please try again.";
    } else {
        $nid = trim($conn->real_escape_string($_POST['nid']));
        $name = trim($conn->real_escape_string($_POST['name']));
        $phone = trim($conn->real_escape_string($_POST['phone']));
        $age = intval($_POST['age']);
        $category = $conn->real_escape_string($_POST['category']);
        
        // Validation
        $errors = [];
    
    if (empty($nid) || !preg_match('/^\d{10}$/', $nid)) {
        $errors[] = "NID must be exactly 10 digits";
    }
    
    // Check if NID already exists for another recipient
    if (!empty($nid) && isset($original_nid)) {
        $nidCheck = $conn->prepare("SELECT nid FROM Recipients WHERE nid = ? AND nid != ?");
        if ($nidCheck) {
            $nidCheck->bind_param("ss", $nid, $original_nid);
            $nidCheck->execute();
            $nidResult = $nidCheck->get_result();
            if ($nidResult->num_rows > 0) {
                $errors[] = "This NID is already registered with another recipient";
            }
            $nidCheck->close();
        } else {
            $errors[] = "Database error occurred while checking NID";
        }
    }
    
    if (empty($name)) {
        $errors[] = "Full name is required";
    }
    
    if (empty($phone) || !preg_match('/^01[0-9]{9}$/', $phone)) {
        $errors[] = "Valid phone number is required (01xxxxxxxxx format)";
    }
    
    if ($age < 1 || $age > 120) {
        $errors[] = "Age must be between 1 and 120";
    }
    
    // Category-specific age validation
    if ($category === 'Elderly' && $age < 60) {
        $errors[] = "Age must be 60 or above for Elderly category";
    }
    
    if (empty($category)) {
        $errors[] = "Category is required";
    }
    
    // Initialize uploadOk variable
    $uploadOk = 1;
    
    if (empty($errors)) {
        if ($_FILES["photo"]["size"] > 0) {
            // Handle new photo upload
            $target_dir = "uploads/";
            $photo = $target_dir . basename($_FILES["photo"]["name"]);
            $uploadOk = 1;
            $imageFileType = strtolower(pathinfo($photo,PATHINFO_EXTENSION));
            
            // Check if image file is actual image
            $check = getimagesize($_FILES["photo"]["tmp_name"]);
            if($check === false) {
                $errors[] = "File is not an image";
                $uploadOk = 0;
            }
            
            // Check file size
            if ($_FILES["photo"]["size"] > 500000) {
                $errors[] = "Sorry, your file is too large";
                $uploadOk = 0;
            }
            
            // Allow certain file formats
            if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
                $errors[] = "Sorry, only JPG, JPEG, PNG files are allowed";
                $uploadOk = 0;
            }
            
            if ($uploadOk == 1) {
                if (move_uploaded_file($_FILES["photo"]["tmp_name"], $photo)) {
                    // Delete old photo
                    if (file_exists($recipient['photo'])) {
                        unlink($recipient['photo']);
                    }
                    
                    $sql = "UPDATE Recipients SET 
                            nid = '$nid',
                            name = '$name',
                            phone = '$phone',
                            age = $age,
                            category = '$category',
                            photo = '$photo'
                            WHERE nid = '$original_nid'";
                } else {
                    $errors[] = "Sorry, there was an error uploading your file";
                }
            }
        } else {
            // Update without changing photo
            $sql = "UPDATE Recipients SET 
                    nid = '$nid',
                    name = '$name',
                    phone = '$phone',
                    age = $age,
                    category = '$category'
                    WHERE nid = '$original_nid'";
        }
        
        if (empty($errors) && ($uploadOk != 0)) {
            if ($conn->query($sql) === TRUE) {
                $message = "Recipient updated successfully!";
                // Refresh recipient data using the new NID
                $refreshSql = "SELECT * FROM Recipients WHERE nid = '$nid'";
                $result = $conn->query($refreshSql);
                $recipient = $result->fetch_assoc();
                $original_nid = $nid; // Update original_nid for future edits
            } else {
                $errors[] = "Error updating recipient: " . $conn->error;
            }
        }
    } // Close the if (empty($errors)) block
    } // Close the else block for original_nid check
} // <-- This closes the POST request handling block
?>

<?php include 'includes/header.php'; ?>

<div class="form-container">
    <h2>Edit Recipient</h2>
    
    <?php if (!empty($errors)): ?>
        <div class="alert alert-error">
            <ul style="margin: 0; padding-left: 20px;">
                <?php foreach($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
    
    <?php if ($message): ?>
        <div class="alert <?php echo strpos($message, 'successfully') !== false ? 'alert-success' : 'alert-error'; ?>">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>

    <?php if ($recipient): ?>
        <form action="" method="POST" enctype="multipart/form-data" id="editForm">
            <div class="form-group">
                <label for="nid">National ID (NID)</label>
                <input type="text" id="nid" name="nid" pattern="[0-9]{10}" value="<?php echo htmlspecialchars($recipient['nid']); ?>" required>
                <span class="error-message" id="nid-error"></span>
            </div>

            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($recipient['name']); ?>" required>
                <span class="error-message" id="name-error"></span>
            </div>

            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" pattern="01[0-9]{9}" value="<?php echo htmlspecialchars($recipient['phone']); ?>" required>
                <span class="error-message" id="phone-error"></span>
            </div>

            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" id="age" name="age" min="1" max="120" value="<?php echo $recipient['age']; ?>" required>
                <span class="error-message" id="age-error"></span>
            </div>

            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" name="category" required onchange="updateAgeRequirement()">
                    <option value="">Select Category</option>
                    <option value="Widow" <?php echo $recipient['category'] == 'Widow' ? 'selected' : ''; ?>>Widow</option>
                    <option value="Elderly" <?php echo $recipient['category'] == 'Elderly' ? 'selected' : ''; ?>>Elderly (Age 60+)</option>
                    <option value="Disabled" <?php echo $recipient['category'] == 'Disabled' ? 'selected' : ''; ?>>Disabled</option>
                </select>
                <span class="error-message" id="category-error"></span>
                <small id="age-requirement" style="color: #7f8c8d; font-size: 12px; display: <?php echo $recipient['category'] == 'Elderly' ? 'block' : 'none'; ?>;">Minimum age: 60 years</small>
            </div>

            <div class="form-group">
                <label for="photo">Photo (Leave empty to keep current photo)</label>
                <input type="file" id="photo" name="photo" accept="image/*" onchange="previewImage(this)">
                <span class="error-message" id="photo-error"></span>
                <img id="photoPreview" src="<?php echo htmlspecialchars($recipient['photo']); ?>" alt="Current Photo" style="max-width: 200px; margin-top: 10px;">
            </div>

            <button type="submit" class="btn btn-primary">Update Recipient</button>
            <a href="recipients.php" class="btn btn-secondary">Back to Recipients List</a>
        </form>
        
        <script>
            function previewImage(input) {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('photoPreview').src = e.target.result;
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            }
            
            function updateAgeRequirement() {
                const category = document.getElementById('category').value;
                const ageRequirement = document.getElementById('age-requirement');
                
                if (category === 'Elderly') {
                    ageRequirement.style.display = 'block';
                } else {
                    ageRequirement.style.display = 'none';
                }
            }
            
            // Client-side validation
            document.getElementById('editForm').addEventListener('submit', function(e) {
                const nid = document.getElementById('nid').value.trim();
                const name = document.getElementById('name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const age = parseInt(document.getElementById('age').value);
                const category = document.getElementById('category').value;
                
                let hasErrors = false;
                
                // Clear previous errors
                document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
                document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
                    el.style.borderColor = '';
                    el.style.backgroundColor = '';
                });
                
                if (!nid || !/^\d{10}$/.test(nid)) {
                    showFieldError('nid', 'NID must be exactly 10 digits');
                    hasErrors = true;
                }
                
                if (!name) {
                    showFieldError('name', 'Full name is required');
                    hasErrors = true;
                }
                
                if (!phone || !/^01[0-9]{9}$/.test(phone)) {
                    showFieldError('phone', 'Valid phone number required (01xxxxxxxxx)');
                    hasErrors = true;
                }
                
                if (!age || age < 1 || age > 120) {
                    showFieldError('age', 'Age must be between 1 and 120');
                    hasErrors = true;
                }
                
                // Category-specific age validation
                if (category === 'Elderly' && age < 60) {
                    showFieldError('age', 'Age must be 60 or above for Elderly category');
                    hasErrors = true;
                }
                
                if (!category) {
                    showFieldError('category', 'Category is required');
                    hasErrors = true;
                }
                
                if (hasErrors) {
                    e.preventDefault();
                    return false;
                }
            });
            
            function showFieldError(fieldId, message) {
                const field = document.getElementById(fieldId);
                const errorSpan = document.getElementById(fieldId + '-error');
                field.style.borderColor = '#e74c3c';
                field.style.backgroundColor = '#fdf2f2';
                errorSpan.textContent = message;
            }
        </script>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
