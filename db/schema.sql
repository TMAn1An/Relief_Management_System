-- Create Recipients table
CREATE TABLE Recipients (
    nid VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    age INT NOT NULL,
    category ENUM('Widow', 'Elderly', 'Disabled') NOT NULL,
    photo VARCHAR(255) NOT NULL,
    status ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending'
);

-- Create ReliefCards table
CREATE TABLE ReliefCards (
    card_no INT(6) ZEROFILL AUTO_INCREMENT PRIMARY KEY,
    nid VARCHAR(20) NOT NULL,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nid) REFERENCES Recipients(nid) ON DELETE CASCADE
);

-- Create Requests table
CREATE TABLE Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    nid VARCHAR(20) NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (nid) REFERENCES Recipients(nid) ON DELETE CASCADE
);

-- Create Distributions table
CREATE TABLE Distributions (
    distribution_id INT AUTO_INCREMENT PRIMARY KEY,
    nid VARCHAR(20) NOT NULL,
    item_name VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nid) REFERENCES Recipients(nid) ON DELETE CASCADE
);

-- Create MonthlyRequests table for monthly statistics
CREATE TABLE MonthlyRequests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_requests INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY year_month_idx (year, month)
);
