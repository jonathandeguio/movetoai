-- ─────────────────────────────────────────────────────────────────────────────
-- BluePilot AI — Database bootstrap script
-- Run as MySQL root: mysql -u root -p < db-setup.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create database
CREATE DATABASE IF NOT EXISTS movetoai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create application user (change password below before running)
CREATE USER IF NOT EXISTS 'movetoai'@'localhost'
  IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON movetoai.* TO 'movetoai'@'localhost';
FLUSH PRIVILEGES;

-- 4. Verify
SELECT
  User,
  Host,
  plugin
FROM mysql.user
WHERE User = 'movetoai';

SHOW GRANTS FOR 'movetoai'@'localhost';
