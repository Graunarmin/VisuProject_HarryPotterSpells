import nltk
from nltk.corpus import PlaintextCorpusReader  as PCR
from nltk import word_tokenize
import pickle
import os
import sys

def  get_spells_from_book(path, spells, tmp_spells):
    f = open(path, 'r')
    raw = f.read()
    tokens = word_tokenize(raw)

    for spell in spells:
        if (spell not in tmp_spells) and (spell in tokens):
            tmp_spells.add(spell)

def get_books(path):

    books = ['HP_01.txt', 'HP_02.txt', 'HP_03.txt', 'HP_04.txt', 'HP_05.txt', 'HP_06.txt', 'HP_07.txt']
    s = open('../Data/spells.json')
    
