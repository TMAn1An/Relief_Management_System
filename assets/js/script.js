// Print functionality
function printCard(cardId) {
    const cardElement = document.getElementById(cardId);
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Relief Card</title>');
    printWindow.document.write('<link rel="stylesheet" href="/NEW_Project/assets/css/style.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(cardElement.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const nid = form.querySelector('input[name="nid"]');
    const age = form.querySelector('input[name="age"]');
    const phone = form.querySelector('input[name="phone"]');

    if (nid && !validateNID(nid.value)) {
        alert('Please enter a valid NID number');
        return false;
    }

    if (age && !validateAge(age.value)) {
        alert('Please enter a valid age');
        return false;
    }

    if (phone && !validatePhone(phone.value)) {
        alert('Please enter a valid phone number');
        return false;
    }

    return true;
}

function validateNID(nid) {
    return /^\d{10}$/.test(nid);
}

function validateAge(age) {
    const ageNum = parseInt(age);
    return ageNum >= 0 && ageNum <= 120;
}

function validatePhone(phone) {
    return /^01\d{9}$/.test(phone);
}

// Image preview
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreview').style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Dynamic table filtering
function filterTable(input, tableId) {
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        
        rows[i].style.display = found ? '' : 'none';
    }
}

// Show success/error messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    
    document.querySelector('main').insertBefore(messageDiv, document.querySelector('main').firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Initialize tooltips and other UI elements
document.addEventListener('DOMContentLoaded', function() {
    // Add any initialization code here
});
