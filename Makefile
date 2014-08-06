BASEDIR=$(CURDIR)
OUTPUTDIR=$(BASEDIR)/static

github:
	echo "stategame.jarv.org" > $(OUTPUTDIR)/CNAME
	ghp-import $(OUTPUTDIR)
	git push origin gh-pages
