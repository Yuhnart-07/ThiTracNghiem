FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

COPY docker/mssql/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/mssql/init-db.sh /usr/local/bin/init-db.sh
COPY THITRACNGHIEM.sql /docker-entrypoint-initdb.d/THITRACNGHIEM.sql

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/init-db.sh

USER mssql

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
