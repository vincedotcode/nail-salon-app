-- DS Nails Database Schema V2

-- Add final_price column to bookings if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);

-- Modify availability table to be day-of-week based (working hours)
-- Drop old availability table and recreate
DROP TABLE IF EXISTS availability CASCADE;

-- Working hours table (default working schedule)
CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(day_of_week)
);

-- Blocked days table (days off, not working)
CREATE TABLE IF NOT EXISTS blocked_days (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default working hours (Mon-Sat 9am-6pm, Sunday closed)
INSERT INTO working_hours (day_of_week, start_time, end_time, is_active) VALUES
(0, '09:00', '18:00', false),  -- Sunday (closed)
(1, '09:00', '18:00', true),   -- Monday
(2, '09:00', '18:00', true),   -- Tuesday
(3, '09:00', '18:00', true),   -- Wednesday
(4, '09:00', '18:00', true),   -- Thursday
(5, '09:00', '18:00', true),   -- Friday
(6, '09:00', '18:00', true)    -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Update bookings to have service duration tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
