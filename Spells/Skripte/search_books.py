import nltk
from nltk.corpus import PlaintextCorpusReader  as PCR
from nltk import word_tokenize
import json
import pickle
import os
import sys

def  get_spells_from_book(book, spell_list):
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

def load_books_and_spells():
    """load the spells to be filtered and loop to go through all books to filter them"""
    
    spells = []
    books = ['HP_01.txt', 'HP_02.txt', 'HP_03.txt', 'HP_04.txt', 'HP_05.txt', 'HP_06.txt', 'HP_07.txt']

    with open("../Data/spells.json", "r") as jsonfile:
        s = json.load(jsonfile)


    s = s['spell']
    spell_list = []
    for word in s:
        if " " in word:
            word = word.split()
            word = word[0]
        spell_list.append(word)
    #print(len(spell_list))
    print(spell_list)
    

    for book in books:
        spells.append(get_spells_from_book(book, spell_list))

    print(spells)


def main():
    
    #file = sys.argv[1]

    load_books_and_spells()

if __name__ == '__main__':
    main()

    
