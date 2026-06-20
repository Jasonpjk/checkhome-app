#!/bin/bash
set -e

python -c "
import os
from sqlalchemy import create_engine, text, inspect as sa_inspect

db_url = os.environ.get('DATABASE_URL', '')
if not db_url:
    print('No DATABASE_URL found, skipping stamp check')
else:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        insp = sa_inspect(engine)
        tables = insp.get_table_names()
        has_users = 'users' in tables
        has_alembic = 'alembic_version' in tables

        if has_users and not has_alembic:
            print('Existing DB detected (no alembic_version). Stamping revision 001...')
            conn.execute(text('CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL, CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num))'))
            conn.execute(text(\"INSERT INTO alembic_version (version_num) VALUES ('001') ON CONFLICT DO NOTHING\"))
            conn.commit()
            print('Stamped with revision 001.')
        elif not has_users:
            print('Fresh DB. Alembic will create all tables.')
        else:
            print('Alembic version tracking already in place.')
    engine.dispose()
"

echo "Running alembic upgrade head..."
alembic upgrade head

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
