Integration tests helper scripts
================================

Files
- `setup-integration-env.sh`: Creates a temporary directory and (optionally) starts a Postgres Docker container when `USE_DOCKER_DB=1`. Exports DB connection env vars into the tempdir `.env` file.
- `teardown-integration-env.sh`: Stops and removes the Docker container (if any) and deletes the temporary directory.
- `run-integration.sh`: High-level runner that calls setup, runs Jest limited to `src/integration`, then tears down.

Usage

Run the integration tests anywhere in the repo with:

```bash
bash ./scripts/integration/run-integration.sh
```

To run with a Docker Postgres instance (the script will attempt to map to host port 54321 by default):

```bash
USE_DOCKER_DB=postgres POSTGRES_PORT=54321 bash ./scripts/integration/run-integration.sh
```

To run with a Docker MySQL instance (the script will attempt to map to host port 33306 by default):

```bash
USE_DOCKER_DB=mysql MYSQL_PORT=33306 MYSQL_ROOT_PASSWORD=pass MYSQL_DATABASE=testdb MYSQL_USER=testuser MYSQL_PASSWORD=pass bash ./scripts/integration/run-integration.sh
```

Notes
- By default the scripts do not start any DB. They simply create a temporary directory and export `INTEGRATION_TMPDIR` for test processes.
- When `USE_DOCKER_DB=1` is set, Docker is required on the machine running the tests.
- The started Postgres container uses the following defaults unless overridden: `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`, `POSTGRES_DB=testdb`.
 - The runner reads env vars written by the setup script and exports them for Jest, so your integration tests can read `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
 - For full project dockerization see `docker-compose.yml` and `Dockerfile` in the repository root. `docker-compose up` will start the app and a MySQL service.
