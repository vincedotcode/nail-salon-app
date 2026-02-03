-- Add password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add nail designs saved by users
CREATE TABLE IF NOT EXISTS nail_designs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  generated_image_url TEXT,
  template_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add avatar_url to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add working_hours table if not exists
CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(day_of_week)
);

-- Insert default working hours (Mon-Sat 9am-6pm, Sun closed)
INSERT INTO working_hours (day_of_week, start_time, end_time, is_active) VALUES
(0, '10:00', '17:00', false),  -- Sunday (closed)
(1, '09:00', '18:00', true),   -- Monday
(2, '09:00', '18:00', true),   -- Tuesday
(3, '09:00', '18:00', true),   -- Wednesday
(4, '09:00', '18:00', true),   -- Thursday
(5, '09:00', '18:00', true),   -- Friday
(6, '09:00', '16:00', true)    -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Add duration_minutes and final_price to bookings if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);
