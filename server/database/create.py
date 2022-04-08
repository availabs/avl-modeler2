import sqlite3
from sqlite3 import Error


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)

        c = conn.cursor()
        c.execute('''
          CREATE TABLE IF NOT EXISTS users
          ([id] INTEGER PRIMARY KEY, [email] TEXT)
          ''')
        c.execute('''
          CREATE TABLE IF NOT EXISTS projects
          ([id] INTEGER PRIMARY KEY, [Name] TEXT, [geoList] TEXT, [options] TEXT)
          ''')
        c.execute('''
          CREATE TABLE IF NOT EXISTS projects_users
          ([user_id] INTEGER, [project_id] INTEGER)
          ''')

        conn.commit()
        print("success")
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    create_connection(r"./activitysimserver.sqlite")
