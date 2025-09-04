-- SPARC Dice Rolling Database Schema
-- Optimized for high-performance dice roll storage and analytics

-- Create dice_rolls table for storing all dice roll results
CREATE TABLE IF NOT EXISTS dice_rolls (
    id VARCHAR(16) PRIMARY KEY,                    -- Dice roll ID (8-byte hex)
    session_id VARCHAR(255) NOT NULL,              -- Game session ID
    character_id VARCHAR(255) NOT NULL,            -- Rolling character ID
    roll_type VARCHAR(50) NOT NULL,                -- Type of roll (attack, skill, save, etc.)
    dice_count INTEGER NOT NULL CHECK (dice_count BETWEEN 1 AND 20),
    dice_sides INTEGER NOT NULL CHECK (dice_sides IN (4, 6, 8, 10, 12, 20)),
    modifier INTEGER NOT NULL DEFAULT 0,           -- Flat modifier
    result INTEGER NOT NULL,                       -- Final roll result
    individual_rolls JSONB NOT NULL,               -- Array of individual dice results
    difficulty INTEGER,                            -- Target difficulty (optional)
    success BOOLEAN,                               -- Success/failure (optional)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Roll timestamp
    response_time_ms REAL NOT NULL,               -- Engine response time
    
    -- Indexes for performance
    INDEX idx_dice_rolls_session (session_id),
    INDEX idx_dice_rolls_character (character_id),
    INDEX idx_dice_rolls_timestamp (timestamp),
    INDEX idx_dice_rolls_roll_type (roll_type),
    INDEX idx_dice_rolls_performance (response_time_ms, timestamp)
);

-- Create composite index for session analytics
CREATE INDEX IF NOT EXISTS idx_dice_rolls_session_analytics 
ON dice_rolls (session_id, timestamp DESC, roll_type);

-- Create index for character performance analysis
CREATE INDEX IF NOT EXISTS idx_dice_rolls_character_performance
ON dice_rolls (character_id, timestamp DESC) 
WHERE success IS NOT NULL;

-- Create index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_dice_rolls_performance_monitoring
ON dice_rolls (timestamp DESC, response_time_ms)
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- Add table comments for documentation
COMMENT ON TABLE dice_rolls IS 'High-performance storage for SPARC RPG dice rolls with analytics support';
COMMENT ON COLUMN dice_rolls.id IS 'Unique roll identifier (8-byte hex string)';
COMMENT ON COLUMN dice_rolls.session_id IS 'Game session identifier';
COMMENT ON COLUMN dice_rolls.character_id IS 'Character making the roll';
COMMENT ON COLUMN dice_rolls.roll_type IS 'Type of roll: attack, skill_check_str, initiative, etc.';
COMMENT ON COLUMN dice_rolls.individual_rolls IS 'JSON array of individual die results';
COMMENT ON COLUMN dice_rolls.response_time_ms IS 'Dice engine response time for performance monitoring';

-- Create function for roll statistics
CREATE OR REPLACE FUNCTION get_dice_roll_stats(p_session_id VARCHAR)
RETURNS TABLE(
    total_rolls BIGINT,
    avg_result NUMERIC,
    success_rate NUMERIC,
    p95_response_time NUMERIC,
    sub_100ms_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_rolls,
        ROUND(AVG(result), 2) as avg_result,
        ROUND(AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END), 3) as success_rate,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms), 2) as p95_response_time,
        ROUND(AVG(CASE WHEN response_time_ms < 100 THEN 1.0 ELSE 0.0 END), 3) as sub_100ms_rate
    FROM dice_rolls 
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for character performance
CREATE OR REPLACE FUNCTION get_character_performance(p_character_id VARCHAR, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    character_id VARCHAR,
    total_rolls BIGINT,
    avg_result NUMERIC,
    success_rate NUMERIC,
    best_roll INTEGER,
    worst_roll INTEGER,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_character_id as character_id,
        COUNT(*) as total_rolls,
        ROUND(AVG(result), 2) as avg_result,
        ROUND(AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END), 3) as success_rate,
        MAX(result) as best_roll,
        MIN(result) as worst_roll,
        ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM dice_rolls 
    WHERE character_id = p_character_id 
    AND timestamp > NOW() - INTERVAL '%s days', p_days;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cleanup of old rolls
CREATE OR REPLACE FUNCTION cleanup_old_dice_rolls()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete rolls older than 90 days to maintain performance
    DELETE FROM dice_rolls 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup daily
CREATE TRIGGER trigger_cleanup_dice_rolls
    AFTER INSERT ON dice_rolls
    EXECUTE FUNCTION cleanup_old_dice_rolls();

-- Create view for recent session activity
CREATE OR REPLACE VIEW recent_dice_activity AS
SELECT 
    session_id,
    character_id,
    roll_type,
    result,
    success,
    timestamp,
    response_time_ms,
    ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY timestamp DESC) as roll_rank
FROM dice_rolls
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Create view for performance monitoring
CREATE OR REPLACE VIEW dice_performance_metrics AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as total_rolls,
    ROUND(AVG(response_time_ms), 2) as avg_response_time,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms), 2) as p95_response_time,
    ROUND(AVG(CASE WHEN response_time_ms < 100 THEN 1.0 ELSE 0.0 END), 3) as sub_100ms_rate,
    ROUND(AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END), 3) as success_rate
FROM dice_rolls
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Grant permissions for the application
-- Note: Adjust these based on your actual database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dice_rolls TO sparc_app_user;
-- GRANT EXECUTE ON FUNCTION get_dice_roll_stats(VARCHAR) TO sparc_app_user;
-- GRANT EXECUTE ON FUNCTION get_character_performance(VARCHAR, INTEGER) TO sparc_app_user;
-- GRANT SELECT ON recent_dice_activity TO sparc_app_user;
-- GRANT SELECT ON dice_performance_metrics TO sparc_app_user;