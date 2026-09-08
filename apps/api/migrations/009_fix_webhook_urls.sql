-- The Next.js revalidation route lives at /api/revalidate, but the endpoints
-- registered in the CMS pointed at /api/webhook/revalidate (404), so cache
-- invalidation never fired. Repoint them; idempotent on re-run.
UPDATE webhook_endpoints
SET url = replace(url, '/api/webhook/revalidate', '/api/revalidate')
WHERE url LIKE '%/api/webhook/revalidate%';
