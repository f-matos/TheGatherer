from pathlib import Path
from bs4 import BeautifulSoup
import re
import sys
import shutil
import tempfile
import os
import urllib.request
from urllib.parse import quote
from flask import Flask, request, jsonify, send_from_directory
import time
import webbrowser

from dotenv import load_dotenv
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)


def get_data(card):
    url = "https://www.ligamagic.com.br/?view=cards/card&card=" + quote(card)
    with urllib.request.urlopen(url) as response:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            shutil.copyfileobj(response, tmp_file)
            # print(tmp_file.name)

    with open(tmp_file.name) as html:
        soup = BeautifulSoup(html, "html.parser")
    result = []
    try:
        stores = soup.find('div', {'id': 'aba-cards'}).find_all('div', {'mp': '2'})
        for store in stores:
            price_string = store.find(
                'div', {'class': 'e-col3'}).get_text()
            m = re.search('R\$ ([0-9]+),([0-9]+)$', price_string)
            price = float(m.group(1) + '.' + m.group(2))
            stock_string = store.find('div', {'class': 'e-col5'}).get_text()
            m = re.search('^([0-9]+)', stock_string)
            stock = int(m.group(1))
            a = store.find('div', {'class': 'e-col1'}).a
            img = store.find('div', {'class': 'e-col1'}).a.img
            result.append({
                "store": a.img['title'],
                "logo": a.img['src'],
                "ref": a['href'],
                "price": price,
                "stock": stock,
                "quality": store.find('div', {'class': 'e-col4'}).get_text()
            })
            #print((store_string, price))
    except AttributeError as e:
        print(card, e)
    return result


@app.route('/api/<card>', methods=['GET'])
def req_card(card):
    return jsonify(get_data(card))

@app.route('/')
def home():
   return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def send_raw(path):
    return send_from_directory('public', path)


if __name__ == "__main__":
    #url = "http://{}:{}".format(os.getenv('FLASK_RUN_HOST'), os.getenv('FLASK_RUN_PORT'))
    #webbrowser.open(url)
    #app.run(host=os.getenv('FLASK_RUN_HOST'), port=os.getenv('FLASK_RUN_PORT'))
    app.run()
