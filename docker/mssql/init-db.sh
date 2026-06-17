#!/usr/bin/env bash
set -euo pipefail

marker_file="/var/opt/mssql/.thi-trac-nghiem-init-done"
db_name="${DB_NAME:-THITRACNGHIEM}"
sqlcmd="$(command -v sqlcmd || true)"

if [ -z "$sqlcmd" ] && [ -x /opt/mssql-tools18/bin/sqlcmd ]; then
  sqlcmd="/opt/mssql-tools18/bin/sqlcmd"
fi

if [ -z "$sqlcmd" ] && [ -x /opt/mssql-tools/bin/sqlcmd ]; then
  sqlcmd="/opt/mssql-tools/bin/sqlcmd"
fi

if [ -z "$sqlcmd" ]; then
  echo "sqlcmd was not found in the SQL Server image."
  exit 1
fi

if [ -f "$marker_file" ]; then
  echo "Database initialization already completed."
  exit 0
fi

echo "Waiting for SQL Server to accept connections..."
for attempt in $(seq 1 60); do
  if "$sqlcmd" -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    echo "SQL Server did not become ready in time."
    exit 1
  fi

  sleep 2
done

echo "Creating database ${db_name} if needed..."
"$sqlcmd" -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "IF DB_ID(N'${db_name}') IS NULL CREATE DATABASE [${db_name}]"

echo "Importing THITRACNGHIEM.sql..."
if head -c 2 /docker-entrypoint-initdb.d/THITRACNGHIEM.sql | od -An -tx1 | grep -qi "ff fe"; then
  iconv -f UTF-16LE -t UTF-8 /docker-entrypoint-initdb.d/THITRACNGHIEM.sql > /tmp/THITRACNGHIEM.utf8.sql
else
  cp /docker-entrypoint-initdb.d/THITRACNGHIEM.sql /tmp/THITRACNGHIEM.utf8.sql
fi

awk '
  index($0, "USE [THITRACNGHIEM]") > 0 { started = 1 }
  started { print }
' /tmp/THITRACNGHIEM.utf8.sql > /tmp/THITRACNGHIEM.container.sql

if [ ! -s /tmp/THITRACNGHIEM.container.sql ]; then
  echo "Filtered SQL script is empty. Check THITRACNGHIEM.sql encoding or USE statement."
  exit 1
fi

"$sqlcmd" -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -i /tmp/THITRACNGHIEM.container.sql

touch "$marker_file"
echo "Database initialization completed."
