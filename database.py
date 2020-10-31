import psycopg2 as ps
from psycopg2 import sql
from psycopg2.extras import RealDictCursor
import os


class Queries:
    def __init__(self):
        self.save_score = "INSERT INTO score(score) VALUES (%(score)s)"
        self.get_highscore = "SELECT score FROM score ORDER BY score desc LIMIT 1"


class DB:
    def __init__(self):
        self.host = os.environ.get("DATABASE_HOST")
        self.username = os.environ.get("DATABASE_USERNAME")
        self.password = os.environ.get("DATABASE_PASSWORD")
        self.name = os.environ.get("DATABASE_NAME")

    def execute_query(self, query, params=None):
        try:
            with ps.connect(
                host=self.host,
                user=self.username,
                password=self.password,
                dbname=self.name,
                port=5432
            ) as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as curs:
                    curs.execute(sql.SQL(query), params)

                    try:
                        output = curs.fetchall()
                    except ps.ProgrammingError:
                        output = None

                    return output
        finally:
            conn.close()


db = DB()
queries = Queries()
