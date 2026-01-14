#!/usr/bin/env bash
set -euo pipefail

# Runner that sets up integration environment, runs integration tests, then tears down.

SCRIPTDIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
SETUP="$SCRIPTDIR/setup-integration-env.sh"
TEARDOWN="$SCRIPTDIR/teardown-integration-env.sh"

echo "Setting up integration environment..."
source "$SETUP"

# Export any .env values created by setup for child processes
if [ -f "$INTEGRATION_TMPDIR/.env" ]; then
  set -o allexport
  source "$INTEGRATION_TMPDIR/.env"
  set +o allexport
fi

EXIT_CODE=0
echo "Running integration tests (jest)"

# Prefer project-local jest binary if available
if [ -x "./node_modules/.bin/jest" ]; then
  JEST_CMD="./node_modules/.bin/jest"
else
  JEST_CMD="npx jest"
fi

"$JEST_CMD" --testPathPattern=src/integration --runInBand || EXIT_CODE=$?

echo "Running teardown..."
INTEGRATION_TMPDIR=${INTEGRATION_TMPDIR:-}
source "$TEARDOWN"

exit $EXIT_CODE
