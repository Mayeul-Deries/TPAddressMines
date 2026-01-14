#!/usr/bin/env bash
set -euo pipefail

# Creates a temporary environment for integration tests.
# By default this does not start any DB. To start a Postgres container for tests,
# set USE_DOCKER_DB=1 before running the runner script. The script will export
# connection environment variables for the test process.

TMPDIR=$(mktemp -d -t integration-env-XXXXXX)
echo "INTEGRATION_TMPDIR=$TMPDIR" > "$TMPDIR/.env"
export INTEGRATION_TMPDIR="$TMPDIR"

echo "Created integration tmpdir: $TMPDIR"

# Default: no DB. If user wants a Docker-backed Postgres for integration tests,
# set USE_DOCKER_DB=1 and optionally configure POSTGRES_PORT.
if [ "${USE_DOCKER_DB:-0}" = "1" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "USE_DOCKER_DB=1 but docker not found in PATH" >&2
    exit 1
  fi

  POSTGRES_PORT="${POSTGRES_PORT:-54321}"
  POSTGRES_USER="${POSTGRES_USER:-postgres}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
  POSTGRES_DB="${POSTGRES_DB:-testdb}"

  CONTAINER_NAME="tmp_integration_postgres_$RANDOM"
  echo "Starting postgres container $CONTAINER_NAME (host port $POSTGRES_PORT)..."

  docker run --rm -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_USER="$POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB="$POSTGRES_DB" \
    -p "$POSTGRES_PORT:5432" \
    postgres:15 > "$TMPDIR/container.id"

  # wait for postgres to accept connections (simple loop)
  attempts=0
  until docker exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1 || [ $attempts -ge 30 ]; do
    attempts=$((attempts + 1))
    sleep 1
  done

  if [ $attempts -ge 30 ]; then
    echo "Postgres did not become ready in time" >&2
    docker logs "$CONTAINER_NAME" || true
    docker rm -f "$CONTAINER_NAME" || true
    exit 1
  fi

  # Export DB connection info for tests
  export DB_HOST=127.0.0.1
  export DB_PORT="$POSTGRES_PORT"
  export DB_USER="$POSTGRES_USER"
  export DB_PASSWORD="$POSTGRES_PASSWORD"
  export DB_NAME="$POSTGRES_DB"

  echo "Started Postgres container $CONTAINER_NAME (id saved to $TMPDIR/container.id)"
  echo "DB_HOST=$DB_HOST" >> "$TMPDIR/.env"
  echo "DB_PORT=$DB_PORT" >> "$TMPDIR/.env"
  echo "DB_USER=$DB_USER" >> "$TMPDIR/.env"
  echo "DB_PASSWORD=$DB_PASSWORD" >> "$TMPDIR/.env"
  echo "DB_NAME=$DB_NAME" >> "$TMPDIR/.env"
fi

echo "$TMPDIR" > "$TMPDIR/.tmpdir"
echo "Setup complete"
