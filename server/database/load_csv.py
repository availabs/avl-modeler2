import sqlite3
import pandas as pd

# load data
df = pd.read_csv('./data/psam_p36.csv', sep=',',
                 error_bad_lines=False, index_col=False, dtype='unicode')

# strip whitespace from headers
df.columns = df.columns.str.strip()

con = sqlite3.connect("./activitysimserver.sqlite")

# drop data into database
df.to_sql("psam_p36", con)

con.close()
