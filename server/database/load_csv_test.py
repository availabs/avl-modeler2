import csv
import sqlite3

# change to 'sqlite:///your_filename.db'
con = sqlite3.connect("./activitysimserver.sqlite")
cur = con.cursor()
# use your column names here
# cur.execute("CREATE TABLE test ("Name","Sex","Age","Height","Weight");")
cur.execute("CREATE TABLE test2 (Name, Sex, Age, Height,Weight);")
# cur.execute("CREATE TABLE test2 ("Name","Sex","Age","Height","Weight");")

with open('./data/biostats.csv', 'r') as fin:  # `with` statement available in 2.5+
    # csv.DictReader uses first line in file for column headings by default
    dr = csv.DictReader(fin)  # comma is default delimiter
    to_db = [(i['Name'], i['Sex'], i['Age'], i['Height'], i['Weight'])
             for i in dr]

cur.executemany(
    "INSERT INTO t (Name, Sex, Age, Height, Weight) VALUES (?, ?, ?, ?, ?);", to_db)
con.commit()
con.close()
