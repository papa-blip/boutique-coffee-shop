from html.parser import HTMLParser
from pathlib import Path

class Checker(HTMLParser):
    pass

for path in sorted(Path('.').glob('*.html')):
    parser = Checker()
    parser.feed(path.read_text(encoding='utf-8'))
    print(f'{path.name}: parsed')
