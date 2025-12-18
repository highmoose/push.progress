-- Push Progress Database Schema
-- Created: December 17, 2025
-- Database: push_progress

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default users (Adam and Cory)
INSERT INTO users (username, password) VALUES 
    ('Adam', 'Letmein123'),
    ('Cory', 'Cory123')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- EXERCISES TABLE (Shared between all users)
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_by_user_id INT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_muscle_group (muscle_group),
    INDEX idx_type (type),
    INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER_EXERCISES TABLE (User's personal exercise list)
-- ============================================
CREATE TABLE IF NOT EXISTS user_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_exercise (user_id, exercise_id),
    INDEX idx_user_id (user_id),
    INDEX idx_exercise_id (exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXERCISE_RECORDS TABLE (Weight and reps tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    weight_kg DECIMAL(6,2) NOT NULL,
    reps INT NOT NULL,
    record_date DATE NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_exercise_date (user_id, exercise_id, record_date),
    INDEX idx_user_exercise (user_id, exercise_id),
    INDEX idx_record_date (record_date),
    INDEX idx_user_date (user_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample exercises
INSERT INTO exercises (title, muscle_group, type, created_by_user_id) VALUES
    ('Bench Press', 'chest', 'free weight', 1),
    ('Barbell Curl', 'biceps', 'free weight', 1),
    ('Leg Press', 'quads', 'machine', 2),
    ('Lat Pulldown', 'back', 'machine', 2);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all exercises for a user with their personal list status
-- SELECT e.*, 
--        CASE WHEN ue.id IS NOT NULL THEN 1 ELSE 0 END as in_my_list,
--        u.username as created_by
-- FROM exercises e
-- LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = ?
-- LEFT JOIN users u ON e.created_by_user_id = u.id
-- WHERE e.is_deleted = 0
-- ORDER BY e.muscle_group, e.title;

-- Get exercise records with date range
-- SELECT * FROM exercise_records 
-- WHERE user_id = ? 
--   AND exercise_id = ? 
--   AND record_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
-- ORDER BY record_date ASC;

-- Get average weight for muscle group comparison
-- SELECT AVG(er.weight_kg) as avg_weight, er.record_date
-- FROM exercise_records er
-- JOIN exercises e ON er.exercise_id = e.id
-- WHERE er.user_id = ? 
--   AND e.muscle_group = ?
--   AND e.is_deleted = 0
-- GROUP BY er.record_date
-- ORDER BY er.record_date ASC;
