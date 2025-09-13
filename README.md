# Relief Management System

A comprehensive web-based relief management system built with PHP and MySQL for managing recipients, distributions, and monthly relief requests.

## Features

- **Recipient Management**: Register, edit, and manage relief recipients
- **Distribution Tracking**: Track and manage relief distributions
- **Monthly Requests**: Handle monthly relief requests with countdown timer
- **Professional Cards**: Generate printable relief cards
- **Search & Filter**: Advanced search and filtering capabilities
- **Statistics**: Monthly statistics and reporting
- **Responsive Design**: Works on desktop and laptop screens

## System Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Modern web browser

## Installation

1. Clone this repository to your web server directory
2. Import the database schema from `db/schema.sql`
3. Configure database connection in `config/db_connect.php`
4. Set up proper permissions for the `uploads/` directory
5. Access the application through your web browser

## Database Setup

```sql
-- Create database
CREATE DATABASE relief_management;

-- Import the schema
mysql -u username -p relief_management < db/schema.sql
```

## Configuration

Update `config/db_connect.php` with your database credentials:

```php
$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "relief_management";
```

## Usage

1. **Registration**: Add new recipients through the registration form
2. **Recipients**: View, search, and edit recipient information
3. **Distribution**: Manage relief distributions and track inventory
4. **Monthly Requests**: Handle monthly relief requests
5. **Statistics**: View distribution statistics and reports

## Security Features

- Input validation and sanitization
- SQL injection prevention
- File upload security
- Session management
- CSRF protection

## File Structure

```
├── ajax/                   # AJAX endpoints
├── assets/                 # CSS, JS, and images
├── config/                 # Database configuration
├── db/                     # Database schema
├── includes/               # Header and footer templates
├── uploads/                # User uploaded files
├── *.php                   # Main application files
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.