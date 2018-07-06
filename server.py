from bs4 import BeautifulSoup
import re
import sys
import shutil
import tempfile
import os
import urllib.request
from urllib.parse import quote
from flask import Flask, request, jsonify
app = Flask(__name__)
import time


def get_data(card):
    url = "https://www.ligamagic.com.br/?view=cards/card&card=" + card
    with urllib.request.urlopen(url) as response:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            shutil.copyfileobj(response, tmp_file)
            # print(tmp_file.name)

    with open(tmp_file.name) as html:
        soup = BeautifulSoup(html, "html.parser")
    result = []
    try:
        stores = soup.find('div', {'id': 'aba-cards'}
                           ).find_all('div', {'mp': '2'})
        for store in stores:
            price_string = store.find(
                'div', {'class': 'e-col3'}).get_text()
            m = re.search('R\$ ([0-9]+),([0-9]+)$', price_string)
            price = float(m.group(1) + '.' + m.group(2))

            store_string = store.find(
                'div', {'class': 'e-col1'}).a.img['title']
            result.append((store_string, float(price)))
            #print((store_string, price))
    except AttributeError as e:
        pass
    return result


def run(cards):
    result = {}
    stores = set([])
    for card in cards:
        prices = get_prices_for(quote(card))
        for store, price in prices:
            stores.add(store)
            if store not in result:
                result[store] = {}
            result[store][card] = price
    # print(result)
    for store in result:
        total = 0
        for card in result[store]:
            total += result[store][card]
        result[store]['total'] = round(total, 2)
    return result


@app.route('/<card>', methods=['GET'])
def hello_world(card):
    time.sleep(10)
    # return jsonify({})
    return jsonify(get_data(card))
