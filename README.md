multi url v0.1 08feb2024
made by julianp

don't use config ts to modify the url to scrawl, but use config ts to modify json name for your output document
put the url to crawl in src/tocrawl.csv (toscrawl.csv in root folder is a old relicat)

optional
put all url in allcrawl.csv
use crawlee.py to select which url you want to put in tocrawl.csv
why ? because i didn't modify config.ts, so the name given to the json is static
use txt.py to convert your json in txt for custom gpt input, might have better performance
