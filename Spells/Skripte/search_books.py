import nltk
from nltk.corpus import PlaintextCorpusReader  as PCR
from nltk import word_tokenize
import json
import pickle
import os
import sys
import pandas

def load_spells_from_books():
    """load the spells to be filtered and loop to go through all books to filter them
    No need to convert them to lower case btw, they always start with an upper case letter
    in the books"""
    
    spells = []
    books = ['HP_01.txt', 'HP_02.txt', 'HP_03.txt', 'HP_04.txt', 'HP_05.txt', 'HP_06.txt', 'HP_07.txt']

    #load all spells (just pre-filtered by Hand and added the one-word version)
    spell_json = load_all_spells()
    all_spells = pickle.load(open("../Pickles/all_spells.p", "rb"))

    #filter the spells so the list only contains those that appear in the books
    # for book in books:
    #     book_spells = spells_in_this_book(book, all_spells)
    #     for spell in book_spells:
    #         if spell not in spells:
    #             spells.append(spell)

    # pickle.dump(spells, open("../Pickles/spells_in_books.p", "wb"))
    # print(len(spells))
    # print(spells)
    
    spells = pickle.load(open("../Pickles/spells_in_books.p", "rb"))
    filter_spell_json(spells, spell_json)

def load_all_spells():
    '''load all spells from the website (pre filtered by hand from us) and dump them as pickle'''
    
    with open("../Data/all_spells.json", "r") as jsonfile:
        spell_json = json.load(jsonfile)

    all_spells = []
    for s in spell_json:
        all_spells.append(s['Short'])
    
    pickle.dump(all_spells, open("../Pickles/all_spells.p", "wb"))
    #print(len(all_spells))
    #print(all_spells)
   
    return spell_json


def  spells_in_this_book(book, spell_list):
    """filter spell-list so only those spells that are in the books remain"""

    spells = []
    path = "../../Books/" + book
    f = open(path, 'r')
    raw = f.read()
    tokens = word_tokenize(raw)

    for spell in spell_list:
        if (spell not in spells) and (spell in tokens):
            spells.append(spell)
    
    return spells

def filter_spell_json(spells, spell_json):

    new_json = []
    for s in spell_json:
        if s['Short'] in spells:
            new_json.append(s)

    # print(len(new_json))
    # print(new_json)  

    pickle.dump(new_json, open("../Pickles/spells.p", "wb"))

    #json_string = json.dumps(new_json)
    json.dump(new_json, open('../Data/spells.json', 'w'))

    tmp = pandas.read_json('../Data/spells.json')
    spell_csv = tmp.to_csv()

    tmp.to_csv("../Data/spells_01.csv", encoding='utf-8', index=False)
      

def main():
    
    #file = sys.argv[1]

    load_spells_from_books()

if __name__ == '__main__':
    main()

    
