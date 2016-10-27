kannanir.csv:
	wget http://www.mbl.is/frettir/kosningar/kannanir.csv
	rm kannanir.csv.tmp
	touch kannanir.csv.tmp
	LC_CTYPE=C LANG=C sed -e 's/;/,/g' kannanir.csv > kannanir.csv.tmp
	mv kannanir.csv.tmp kannanir.csv

mbl.csv: kannanir.csv
	iconv --from-code=ISO-8859-1 --to-code=UTF-8 kannanir.csv > mbl.csv

all: mbl.csv

clean:
	rm kannanir.csv mbl.csv
