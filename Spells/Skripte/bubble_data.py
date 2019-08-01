import json
import pickle
from pprint import pprint

def create_treedata():

    years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07']
    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    books = []
    
    for year in years:
        categories = []
        name = ""
        charm = {"name":"Charm","children":[]}
        spell = {"name":"Spell","children":[]}
        curse = {"name":"Curse","children":[]}
        unforg = {"name":"Unforgivable Curse","children":[]}

        for element in spells:
            if element["Type"] == "Charm" and str(element[year]):
                charm["children"].append({"name":element["Spell"],"size":element[year]})
            elif element["Type"] == "Spell" and str(element[year]):
                spell["children"].append({"name":element["Spell"],"size":element[year]})
            elif element["Type"] == "Curse" and str(element[year]):
                curse["children"].append({"name":element["Spell"],"size":element[year]})
            elif element["Type"] == "Unforgivable Curse" and str(element[year]):
                unforg["children"].append({"name":element["Spell"],"size":element[year]})
        
        categories = [charm, spell, curse, unforg]

        if year == "HP_01":
            name = "Philosophers Stone"
        elif year == "HP_02":
            name = "Chamber of Secrets"
        elif year == "HP_03":
            name = "Prisoner of Azkaban"
        elif year == "HP_04":
            name = "Goblet of Fire"
        elif year == "HP_05":
            name = "Order of the Pheonix"
        elif year == "HP_06":
            name = "Halfblood Prince"
        elif year == "HP_07":
            name = "Deathly Hallows"

        books.append({"name":name,"children":categories})
    
    json_dict = {"name":"Spells","children":books}

    pickle.dump(json_dict, open("../Pickles/treemap_data_2.p", "wb"))

    json_string = json.dumps(json_dict)
    json.dump(json_dict, open('../Data/Background/json/treemap_data_2.json', 'w'))


def main():
    
    create_treedata()

if __name__ == '__main__':
    main()