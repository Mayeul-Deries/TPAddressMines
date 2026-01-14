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

# Default: no DB. The script supports starting a DB container for tests.
# Use USE_DOCKER_DB=postgres or USE_DOCKER_DB=mysql (value = "postgres" or "mysql").
if [ -n "${USE_DOCKER_DB:-}" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "USE_DOCKER_DB set but docker not found in PATH" >&2
    exit 1
  fi

  DB_KIND="${USE_DOCKER_DB}"

  if [ "$DB_KIND" = "postgres" ]; then
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

  elif [ "$DB_KIND" = "mysql" ]; then
    MYSQL_PORT="${MYSQL_PORT:-33306}"
    MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-password}"
    MYSQL_DATABASE="${MYSQL_DATABASE:-testdb}"
    MYSQL_USER="${MYSQL_USER:-testuser}"
    MYSQL_PASSWORD="${MYSQL_PASSWORD:-password}"

    CONTAINER_NAME="tmp_integration_mysql_$RANDOM"
    echo "Starting mysql container $CONTAINER_NAME (host port $MYSQL_PORT)..."

    docker run --rm -d \
      --name "$CONTAINER_NAME" \
      -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
      -e MYSQL_DATABASE="$MYSQL_DATABASE" \
      -e MYSQL_USER="$MYSQL_USER" \
      -e MYSQL_PASSWORD="$MYSQL_PASSWORD" \
      -p "$MYSQL_PORT:3306" \
      mysql:8.0 > "$TMPDIR/container.id"

    # wait for mysql to accept connections
    attempts=0
    until docker exec "$CONTAINER_NAME" mysqladmin ping -h "127.0.0.1" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" >/dev/null 2>&1 || [ $attempts -ge 60 ]; do
      attempts=$((attempts + 1))
      sleep 1
    done

    if [ $attempts -ge 60 ]; then
      echo "MySQL did not become ready in time" >&2
      docker logs "$CONTAINER_NAME" || true
      docker rm -f "$CONTAINER_NAME" || true
      exit 1
    fi

    export DB_HOST=127.0.0.1
    export DB_PORT="$MYSQL_PORT"
    export DB_USER="$MYSQL_USER"
    export DB_PASSWORD="$MYSQL_PASSWORD"
    export DB_NAME="$MYSQL_DATABASE"

    echo "Started MySQL container $CONTAINER_NAME (id saved to $TMPDIR/container.id)"
    echo "DB_HOST=$DB_HOST" >> "$TMPDIR/.env"
    echo "DB_PORT=$DB_PORT" >> "$TMPDIR/.env"
    echo "DB_USER=$DB_USER" >> "$TMPDIR/.env"
    echo "DB_PASSWORD=$DB_PASSWORD" >> "$TMPDIR/.env"
    echo "DB_NAME=$DB_NAME" >> "$TMPDIR/.env"

  else
    echo "Unsupported USE_DOCKER_DB value: $DB_KIND. Supported: postgres, mysql" >&2
    exit 1
  fi
fi

echo "$TMPDIR" > "$TMPDIR/.tmpdir"
echo "Setup complete"
