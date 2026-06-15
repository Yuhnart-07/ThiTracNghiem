#!/usr/bin/env bash
set -euo pipefail

/opt/mssql/bin/sqlservr &
sqlservr_pid=$!

/usr/local/bin/init-db.sh

wait "$sqlservr_pid"
