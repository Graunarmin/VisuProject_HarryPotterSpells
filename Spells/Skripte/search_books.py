import nltk
from nltk.corpus import PlaintextCorpusReader  as PCR
from nltk import word_tokenize
import json
import pickle
import os
import sys

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

def load_spells_from_books():
    """load the spells to be filtered and loop to go through all books to filter them
    No need to convert them to lower case btw, they always start with an upper case letter
    in the books"""
    
    spells = []
    books = ['HP_01.txt', 'HP_02.txt', 'HP_03.txt', 'HP_04.txt', 'HP_05.txt', 'HP_06.txt', 'HP_07.txt']

    with open("../Data/spells.json", "r") as jsonfile:
        spell_json = json.load(jsonfile)

    spell_list = []
    for s in spell_json:
        spell_list.append(s['Short'])
    
    print(len(spell_list))
    print(spell_list)

    for book in books:
        book_spells = spells_in_this_book(book, spell_list)
        for spell in book_spells:
            if spell not in spells:
                spells.append(spell)

    print(len(spells))
    print(spells)

    filter_spell_json(spells, spell_json)

def filter_spell_json(spell_list, spell_json):

    new_json = []
    for s in spell_json:
        if s['Short'] in spell_list:
            new_json.append(s)

    print(len(new_json))
    print(new_json)        

def main():
    
    #file = sys.argv[1]

    load_spells_from_books()

if __name__ == '__main__':
    main()

    
