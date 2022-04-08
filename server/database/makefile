COLLECTIONS = \
	data/psam_h36.csv \
	data/psam_p36.csv

all: $(COLLECTIONS)


data/csv_hny.zip:
	@mkdir -p $(@D)
	curl -o $(@D)/csv_hny.zip 'https://www2.census.gov/programs-surveys/acs/data/pums/2019/5-Year/csv_hny.zip'

data/psam_h36.csv: data/csv_hny.zip
	unzip -p data/csv_hny.zip psam_h36.csv > $(@D)/psam_h36.csv

data/csv_pny.zip: 
	@mkdir -p $(@D)
	curl -o $(@D)/csv_pny.zip 'https://www2.census.gov/programs-surveys/acs/data/pums/2019/5-Year/csv_pny.zip'

data/psam_p36.csv: data/csv_pny.zip
	unzip -p data/csv_pny.zip psam_p36.csv > $(@D)/psam_p36.csv