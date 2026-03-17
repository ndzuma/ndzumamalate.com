-- Normalize project sort_order to contiguous 0-based sequence
-- This ensures sort_order values are 0, 1, 2, ... N-1 with no gaps
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) - 1 AS new_order
  FROM projects
)
UPDATE projects
SET sort_order = ranked.new_order
FROM ranked
WHERE projects.id = ranked.id;
