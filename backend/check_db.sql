-- Conecte ao PostgreSQL via PgAdmin ou psql
\c postgres

-- Verifica se o banco existe
SELECT datname FROM pg_database WHERE datname = 'UPX4 Development';

-- Se não existir, crie
CREATE DATABASE "UPX4 Development";

-- Verifica permissões
\du