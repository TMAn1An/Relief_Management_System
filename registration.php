<?php
require_once 'config/db_connect.php';

$message = '';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($conn->real_escape_string($_POST['name']));
    $phone = trim($conn->real_escape_string($_POST['phone']));
    $age = intval($_POST['age']);
    $nid = trim($conn->real_escape_string($_POST['nid']));
    $category = $conn->real_escape_string($_POST['category']);
    
    // Validation
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
    
    if (empty($nid) || !preg_match('/^\d{10}$/', $nid)) {
        $errors[] = "NID must be exactly 10 digits";
    }
    
    if (empty($category)) {
        $errors[] = "Category is required";
    }
    
    // Check for duplicate NID
    if (empty($errors)) {
        $checkSql = "SELECT nid FROM Recipients WHERE nid = '$nid'";
        $checkResult = $conn->query($checkSql);
        if ($checkResult->num_rows > 0) {
            $errors[] = "User already exists with this NID";
        }
    }
    
    // Handle file upload
    $uploadOk = 1;
    $photo = '';
    
    if (!empty($_FILES["photo"]["name"])) {
        $target_dir = "uploads/";
        $photo = $target_dir . basename($_FILES["photo"]["name"]);
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
    } else {
        $errors[] = "Photo is required";
        $uploadOk = 0;
    }
    
    // If no errors, proceed with registration
    if (empty($errors) && $uploadOk == 1) {
        if (move_uploaded_file($_FILES["photo"]["tmp_name"], $photo)) {
            $sql = "INSERT INTO Recipients (nid, name, phone, age, category, photo) 
                    VALUES ('$nid', '$name', '$phone', $age, '$category', '$photo')";
            
            if ($conn->query($sql) === TRUE) {
                $message = "Registration successful!";
            } else {
                $errors[] = "Database error: " . $conn->error;
            }
        } else {
            $errors[] = "Sorry, there was an error uploading your file";
        }
    }
}
?>

<?php include 'includes/header.php'; ?>

<div class="form-container">
    <h2>Recipient Registration</h2>
    
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
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                <?php if (strpos($message, 'successful') !== false): ?>
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: '<?php echo $message; ?>',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3498db',
                        customClass: {
                            popup: 'swal-popup',
                            title: 'swal-title',
                            confirmButton: 'swal-button'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'recipients.php';
                        }
                    });
                <?php endif; ?>
            });
        </script>
    <?php endif; ?>

    <form action="" method="POST" enctype="multipart/form-data" id="registrationForm">
        <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>" required>
            <span class="error-message" id="name-error"></span>
        </div>

        <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" pattern="01[0-9]{9}" value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : ''; ?>" required>
            <span class="error-message" id="phone-error"></span>
        </div>

        <div class="form-group">
            <label for="age">Age</label>
            <input type="number" id="age" name="age" min="1" max="120" value="<?php echo isset($_POST['age']) ? $_POST['age'] : ''; ?>" required>
            <span class="error-message" id="age-error"></span>
        </div>

        <div class="form-group">
            <label for="nid">NID Number</label>
            <input type="text" id="nid" name="nid" pattern="\d{10}" value="<?php echo isset($_POST['nid']) ? htmlspecialchars($_POST['nid']) : ''; ?>" required>
            <span class="error-message" id="nid-error"></span>
        </div>

        <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category" required onchange="updateAgeRequirement()">
                <option value="">Select Category</option>
                <option value="Widow" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Widow') ? 'selected' : ''; ?>>Widow</option>
                <option value="Elderly" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Elderly') ? 'selected' : ''; ?>>Elderly (Age 60+)</option>
                <option value="Disabled" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Disabled') ? 'selected' : ''; ?>>Disabled</option>
            </select>
            <span class="error-message" id="category-error"></span>
            <small id="age-requirement" style="color: #7f8c8d; font-size: 12px; display: none;">Minimum age: 60 years</small>
        </div>

        <div class="form-group">
            <label for="photo">Photo</label>
            <input type="file" id="photo" name="photo" accept="image/*" onchange="previewImage(this)" required>
            <span class="error-message" id="photo-error"></span>
            <img id="photoPreview" src="#" alt="Preview" style="display: none; max-width: 200px; margin-top: 10px;">
        </div>

        <button type="submit" name="submit" class="btn btn-primary">Register</button>
    </form>
    
    <script>
        function previewImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('photoPreview').src = e.target.result;
                    document.getElementById('photoPreview').style.display = 'block';
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
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const age = parseInt(document.getElementById('age').value);
            const nid = document.getElementById('nid').value.trim();
            const category = document.getElementById('category').value;
            const photo = document.getElementById('photo').files[0];
            
            let hasErrors = false;
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
                el.style.borderColor = '';
                el.style.backgroundColor = '';
            });
            
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
            
            if (!nid || !/^\d{10}$/.test(nid)) {
                showFieldError('nid', 'NID must be exactly 10 digits');
                hasErrors = true;
            }
            
            if (!category) {
                showFieldError('category', 'Category is required');
                hasErrors = true;
            }
            
            if (!photo) {
                showFieldError('photo', 'Photo is required');
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
</div>

<?php include 'includes/footer.php'; ?>
