import sqlite3
from sqlite3 import Error


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)

        c = conn.cursor()

        c.execute('''
          INSERT INTO users(
          id, email) VALUES
          (1, 'jwlee38@gmail.com'),
          (2, 'test@gmail.com'),
          (3, 'test1@gmail.com')

          ''')
        c.execute('''
          INSERT INTO users(
          id, email) VALUES
          (2, 'test@gmail.com')
          ''')
        c.execute('''
          INSERT INTO users(
          id, email) VALUES
          (3, 'test1@gmail.com')
          ''')

        c.execute('''
          INSERT INTO projects(
          id, Name, geoList, options) VALUES
          (1, 'Jin Lee','Albany', 'yes' )
          ''')
        c.execute('''
          INSERT INTO projects(
          id, Name, geoList, options) VALUES
          (2, 'Mattew Mongline','Troy', 'no' )
          ''')
        c.execute('''
          INSERT INTO projects(
          id, Name, geoList, options) VALUES
          (3, 'John Logan','Schenectady', 'no' )
          ''')

        c.execute('''
          INSERT INTO projects_users(
          user_id, project_id) VALUES
          (1, 125 )
          ''')
        c.execute('''
          INSERT INTO projects_users(
          user_id, project_id) VALUES
          (2, 256 )
          ''')
        c.execute('''
         INSERT INTO projects_users(
          user_id, project_id) VALUES
          (3, 365 )
          ''')

        conn.commit()
        print(sqlite3.version)
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    create_connection(r"./activitysimserver.sqlite")


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
          ([user_id] INTEGER PRIMARY KEY, [project_id] INTEGER)
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


  (1, [2,4] ),
          (2, [1,2] ),
          (3, [3,5] )
