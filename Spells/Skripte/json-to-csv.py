''' convert the spells.json to csv so we can add categories and dangerousness
    python3 json-to-csv.py 
'''

import csv
import json
import sys
import os
from pprint import pprint

def get_json(file):
    '''loads json from file'''

    with open(file, "r") as jsonfile:
        data = json.load(jsonfile)
        #print(data['effect'])
    
    #print(data)
    prepare_data(data)

def prepare_data(data):
    '''prepares Data in the Form "Spell | Effect | Type | Category | Dangerousness" '''
    
    spelldata = [tuple(["Spell"] + ["Effect"] + ["Type"] + ["Category"] + ["Dangerousness"])]

    size = len(data['spell'])

    for i in range(size):
        m_spell = data['spell'][i]
        m_effect = data["effect"][i]
        m_type = data["type"][i]
        
        spelldata.append(tuple([m_spell] + [m_effect] + [m_type] + [" "] + [" "]))

    #print (spelldata)
    
    into_csv(spelldata)

def into_csv(data):
    '''converts data into csv'''
    with open("../Data/Spells.csv", "w") as csvfile:

        writer = csv.writer(csvfile)

        for element in data:
            writer.writerow(element)


def main():
    
    #file = sys.argv[1]

    get_json("../Data/spells.json")

if __name__ == '__main__':
    main()