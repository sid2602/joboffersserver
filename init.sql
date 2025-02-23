CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  uop VARCHAR(255),
  uz VARCHAR(255),
  b2b VARCHAR(255),
  technologies TEXT,
  link VARCHAR(255),
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);