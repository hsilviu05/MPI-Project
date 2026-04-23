import sys
from pathlib import Path
from tests.conftest import engine, Base
from sqlalchemy import text

print('Engine:', engine)
print('Base metadata tables:', list(Base.metadata.tables.keys()))
print('Creating tables...')
Base.metadata.create_all(bind=engine)
inspector_sql = 'SELECT name FROM sqlite_master WHERE type="table"'
with engine.connect() as conn:
    result = conn.execute(text(inspector_sql))
    tables = result.fetchall()
    print('Tables in DB:', tables)
