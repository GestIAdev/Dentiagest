-- Make priority column NULLABLE to unblock testing
ALTER TABLE appointments ALTER COLUMN priority DROP NOT NULL;
