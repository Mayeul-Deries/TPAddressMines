#!/usr/bin/env bash
set -euo pipefail

# Wait for docker-compose MySQL service to be healthy, then run integration tests
# Usage: bash scripts/integration/run-with-compose.sh

BASE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$BASE_DIR"

DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3306}
DB_USER=${MYSQL_USER:-${DB_USER:-user}}
DB_PASSWORD=${MYSQL_PASSWORD:-${DB_PASSWORD:-password}}
DB_NAME=${MYSQL_DATABASE:-${DB_NAME:-tpaddress}}

echo "Using DB connection: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

attempts=0
max_attempts=60
until docker-compose exec -T mysql mysqladmin ping -h "${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" >/dev/null 2>&1 || [ $attempts -ge $max_attempts ]; do
  attempts=$((attempts + 1))
  echo "Waiting for MySQL to be ready... (${attempts}/${max_attempts})"
  sleep 1
done

if [ $attempts -ge $max_attempts ]; then
  echo "MySQL did not become ready in time" >&2
  docker-compose logs mysql --tail=200 || true
  exit 1
fi

export DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME

echo "Running integration tests..."
if [ -x ./node_modules/.bin/jest ]; then
  ./node_modules/.bin/jest --testPathPattern=src/integration --runInBand
else
  npx jest --testPathPattern=src/integration --runInBand
fi
