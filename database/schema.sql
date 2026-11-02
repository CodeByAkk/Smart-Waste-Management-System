-- =====================================================================
-- SMART WASTE COLLECTION AND MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Database Name: smart_waste_management
-- =====================================================================

CREATE DATABASE IF NOT EXISTS smart_waste_management;
USE smart_waste_management;

-- -----------------------------------------------------
-- Table 1: users (Administrator, Collection Staff, Public User)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'STAFF', 'PUBLIC') NOT NULL DEFAULT 'PUBLIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 8: city_locations (Depots, Intersections, Zones)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS city_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    location_type ENUM('DEPOT', 'INTERSECTION', 'DUSTBIN_POINT', 'LANDFILL') NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 2: dustbins
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dustbins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dustbin_code VARCHAR(30) NOT NULL UNIQUE,
    location_name VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    capacity_liters DOUBLE NOT NULL DEFAULT 500.0,
    current_waste_liters DOUBLE NOT NULL DEFAULT 0.0,
    fill_percentage INT NOT NULL DEFAULT 0,
    category ENUM('GENERAL', 'ORGANIC', 'RECYCLABLE', 'HAZARDOUS', 'ELECTRONIC') NOT NULL DEFAULT 'GENERAL',
    status ENUM('EMPTY', 'MODERATE', 'ALMOST_FULL', 'CRITICAL', 'COLLECTED') NOT NULL DEFAULT 'EMPTY',
    priority_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
    installation_date DATE,
    last_collection_date TIMESTAMP NULL,
    assigned_staff_name VARCHAR(100),
    city_location_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_location_id) REFERENCES city_locations(id) ON DELETE SET NULL,
    INDEX idx_fill_pct (fill_percentage),
    INDEX idx_status (status),
    INDEX idx_priority (priority_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 3: vehicles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) DEFAULT 'Compactor Truck',
    capacity_kg DOUBLE NOT NULL DEFAULT 3500.0,
    current_location VARCHAR(100) NOT NULL DEFAULT 'Central Depot',
    latitude DOUBLE DEFAULT 18.5204,
    longitude DOUBLE DEFAULT 73.8567,
    driver_name VARCHAR(100),
    status ENUM('AVAILABLE', 'ON_DUTY', 'BUSY', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    current_assigned_route VARCHAR(255),
    collected_waste_capacity DOUBLE NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 4: collection_staff
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    assigned_vehicle_id BIGINT,
    assigned_route VARCHAR(255),
    working_status ENUM('ACTIVE', 'ON_LEAVE', 'BUSY') NOT NULL DEFAULT 'ACTIVE',
    completed_collections INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 5: collection_tasks
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_code VARCHAR(30) NOT NULL UNIQUE,
    vehicle_id BIGINT,
    staff_id BIGINT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    route_details TEXT,
    stops_count INT NOT NULL DEFAULT 0,
    total_distance_km DOUBLE NOT NULL DEFAULT 0.0,
    estimated_duration_min INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES collection_staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 6: complaints
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(30) NOT NULL UNIQUE,
    user_name VARCHAR(100) NOT NULL,
    contact_details VARCHAR(50) NOT NULL,
    category ENUM('OVERFLOWING', 'GARBAGE_NOT_COLLECTED', 'DAMAGED_DUSTBIN', 'ILLEGAL_DUMPING', 'UNCLEAN_PUBLIC_AREA') NOT NULL,
    location VARCHAR(150) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    description TEXT NOT NULL,
    photograph_url VARCHAR(500),
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    assigned_staff_id BIGINT,
    admin_notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_staff_id) REFERENCES collection_staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 7: collection_history
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    collection_code VARCHAR(30) NOT NULL UNIQUE,
    dustbin_id BIGINT NOT NULL,
    dustbin_code VARCHAR(30) NOT NULL,
    staff_id BIGINT,
    staff_name VARCHAR(100),
    vehicle_id BIGINT,
    vehicle_number VARCHAR(30),
    collection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_fill_percentage INT NOT NULL,
    collected_waste_quantity DOUBLE NOT NULL,
    collection_status VARCHAR(50) DEFAULT 'COMPLETED',
    FOREIGN KEY (dustbin_id) REFERENCES dustbins(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES collection_staff(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table 9: road_connections (Adjacency List Weighted Edges)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS road_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_location_code VARCHAR(30) NOT NULL,
    target_location_code VARCHAR(30) NOT NULL,
    distance_km DOUBLE NOT NULL,
    road_name VARCHAR(100) NOT NULL,
    is_two_way BOOLEAN DEFAULT TRUE,
    INDEX idx_source (source_location_code),
    INDEX idx_target (target_location_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

