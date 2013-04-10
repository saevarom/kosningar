kannanir.csv:
	wget http://www.mbl.is/frettir/kosningar/kannanir.csv
	sed -i 's/,/\./g' kannanir.csv
	sed -i 's/;/,/g' kannanir.csv

mbl.csv: kannanir.csv
	iconv --from-code=ISO-8859-1 --to-code=UTF-8 kannanir.csv > mbl.csv

all: mbl.csv

clean:
	rm kannanir.csv mbl.csv