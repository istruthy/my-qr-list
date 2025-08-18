-- Migration: Add completion tracking to lists table
-- Date: 2024-01-XX

-- Add completion tracking columns to lists table
ALTER TABLE lists ADD COLUMN is_completed INTEGER DEFAULT 0;
ALTER TABLE lists ADD COLUMN completed_at TEXT;

-- Create index for better performance on completion queries
CREATE INDEX idx_lists_completion ON lists(is_completed, completed_at);

-- Update existing lists to have default completion status
UPDATE lists SET is_completed = 0 WHERE is_completed IS NULL;
