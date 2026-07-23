#!/bin/sh
set -e

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."

until node <<'EOF'
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

await connection.end();
EOF
do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up - starting API server"
exec node src/index.js
