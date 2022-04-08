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
          (241, 'jwlee@albany.com'),
          (2, 'test@gmail.com'),
          (3, 'test1@gmail.com')
          ''')

        c.execute('''
          INSERT INTO projects(
          id, Name, geoList, options) VALUES
          (1, 'Albany land','', '' ),
          (2, 'Troy building','', '' ),
          (3, 'Schenectady forest','', '' ),
          (4, 'Clifton Park water','', '' ),
          (5, 'SUNY dorm','', '' )
          ''')

        c.execute('''
          INSERT INTO projects_users(
          user_id, project_id) VALUES
          (241, 2 ),
          (241, 4 ),
          (2, 3 ),
          (2, 1 ),
          (3, 5 )
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
