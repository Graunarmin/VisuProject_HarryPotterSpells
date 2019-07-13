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
    
    spells = {}
    spell_data = {}
    books = ['HP_01.txt', 'HP_02.txt', 'HP_03.txt', 'HP_04.txt', 'HP_05.txt', 'HP_06.txt', 'HP_07.txt']
    book_data = {}

    #load all spells (just pre-filtered by Hand and added the one-word version)
    spell_json = load_all_spells()
    all_spells = pickle.load(open("../Pickles/all_spells.p", "rb"))

    #filter the spells so the list only contains those that appear in the books
    for book in books:
        data = spells_in_this_book(book, all_spells)
        book_spells = data[0]
        spellcounter = data[1]
        for spell in book_spells:
            #check wheather spell is already in list
            if spell not in spells:
                spells[spell] = {}
                spells[spell]["overall"] = 0
            
            # create spell data - Data for each spell, how often it appears in every book and in all books together
            spells[spell][book.replace(".txt", "")] = book_spells[spell] #Häufigkeit des Vorkommens dieses Spruches in diesem Buch
            spells[spell]["overall"] += book_spells[spell] # insgesamte Häufigkeit hinzufügen

        # create book data - For each book which spells it contains (and how often) and how many spells alltogether
        book_spells["overall"] = spellcounter
        book_data[book.replace(".txt", "")] = book_spells

    pickle.dump(spells, open("../Pickles/spells_in_books.p", "wb"))
    pickle.dump(book_data, open("../Pickles/book_data.p", "wb"))
    # print(len(spells))
    # print(spells)
    # print(book_data)

    
    #spells = pickle.load(open("../Pickles/spells_in_books.p", "rb"))
    build_spell_json(spells, spell_json)

def load_all_spells():
    '''load all spells from the website (pre filtered by hand from us) and dump them as pickle'''
    
    with open("../Data/all_spells.json", "r") as jsonfile:
        spell_json = json.load(jsonfile)

    all_spells = []
    for s in spell_json:
        all_spells.append(s['Short'].lower())
    
    pickle.dump(all_spells, open("../Pickles/all_spells.p", "wb"))
    #print(len(all_spells))
    #print(all_spells)
   
    return spell_json


def  spells_in_this_book(book, spell_list):
    """filter spell-list so only those spells that are in the books remain"""

    spells = {}
    path = "../../Books/" + book
    f = open(path, 'r')
    raw = f.read()
    tokens = word_tokenize(raw)
    words = [w.lower() for w in tokens]
    spellcounter = 0

    for word in words:
        if word in spell_list:
            spell = word
            if spell not in spells:
                spells[spell] = 0
        
            spells[spell] += 1
            spellcounter += 1
    
    return spells, spellcounter

def build_spell_json(spells, spell_json):
    
    new_json = []
    for line in spell_json:
        if line['Short'].lower() in spells:
            spell = line['Short'].lower()
            #print(spell)
            new_line = {"Spell": "", "Short": "", "Effect": "", "Type": "", "Category": "", "Danger": "", "Unforgivable": "",
                        "HP_01": "", "HP_02": "" ,"HP_03": "", "HP_04": "", "HP_05": "", "HP_06": "", "HP_07": "", 
                        "overall": "", "Anmerkung": ""}
            for key in new_line:
                if key in line:
                    new_line[key] = line[key]
                elif key in spells[spell]:
                    new_line[key] = spells[spell][key]
            
            # check for unforgivalbe curses
            if (spell == "Avada") or (spell == "Crucio") or (spell == "Imperio"):
                new_line["Unforgivable"] = "True"
            else:
                new_line["Unforgivable"] = "False"

            #print(new_line)
            new_json.append(new_line)    
    #print(new_json)      

    pickle.dump(new_json, open("../Pickles/spells.p", "wb"))

    json_string = json.dumps(new_json)
    json.dump(new_json, open('../Data/spells.json', 'w'))

    tmp = pandas.read_json('../Data/spells.json')
    spell_csv = tmp.to_csv()

    tmp.to_csv("../Data/spells_01.csv", encoding='utf-8', index=False)  

      

def main():
    
    #file = sys.argv[1]

    load_spells_from_books()

if __name__ == '__main__':
    main()

    
