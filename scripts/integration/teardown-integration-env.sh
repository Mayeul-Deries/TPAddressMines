#!/usr/bin/env bash
set -euo pipefail

# Teardown environment created by setup-integration-env.sh

if [ -z "${INTEGRATION_TMPDIR:-}" ]; then
  # try to find the most recent tmpdir file in /tmp
  # fallback: user should provide INTEGRATION_TMPDIR env var
  echo "INTEGRATION_TMPDIR not set. Attempting to locate tmpdir..."
  DIR_CANDIDATE=$(ls -dt /tmp/integration-env-* 2>/dev/null | head -n1 || true)
  if [ -n "$DIR_CANDIDATE" ]; then
    INTEGRATION_TMPDIR="$DIR_CANDIDATE"
  else
    echo "No integration tmpdir found; nothing to teardown." && exit 0
  fi
fi

echo "Tearing down integration tmpdir: $INTEGRATION_TMPDIR"

if [ -f "$INTEGRATION_TMPDIR/container.id" ]; then
  CONTAINER_NAME=$(docker ps -a --format '{{.Names}}' | grep tmp_integration_postgres_ || true)
  if [ -n "$CONTAINER_NAME" ]; then
    echo "Stopping and removing container(s) matching tmp_integration_postgres_..."
    docker rm -f $CONTAINER_NAME || true
  else
    # try to remove by id file
    CID=$(cat "$INTEGRATION_TMPDIR/container.id" || true)
    if [ -n "$CID" ]; then
      docker rm -f "$CID" || true
    fi
  fi
fi

echo "Removing tmpdir $INTEGRATION_TMPDIR"
rm -rf "$INTEGRATION_TMPDIR" || true
echo "Teardown complete"
