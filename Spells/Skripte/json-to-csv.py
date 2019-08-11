''' convert the spells.json to csv so we can add categories and dangerousness
    python3 json-to-csv.py 
'''

import csv
import json
import sys
import os
from pprint import pprint
import mylib

def prepare_data(path):
    '''prepares Data in the Form "Spell | Effect | Type | Category | Dangerousness" '''
    
    data = mylib.load_json(path)

    spelldata = [tuple(["Spell"] + ["Effect"] + ["Type"] + ["Category"] + ["Dangerousness"])]

    size = len(data['spell'])

    for i in range(size):
        m_spell = data['spell'][i]
        m_effect = data["effect"][i]
        m_type = data["type"][i]
        
        spelldata.append(tuple([m_spell] + [m_effect] + [m_type] + [" "] + [" "]))
    
    mylib.into_csv(spelldata, "../Data/Background/csv/spells.csv")

def main():
    
    prepare_data("../Data/used/spells.json")

if __name__ == '__main__':
    main()