'''Create Data for Barchart'''

import json
import pickle
import mylib

def create_bardata():
    
    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07']
    data = [tuple(["Book"] + ["Overall"] + ["Charm"] + ["Spell"] + ["Curse"] + ["UnforgivableCurse"])]
    

    for year in years:
        print(year)
        overall = 0
        charm = 0
        spell = 0
        curse = 0
        unforg = 0
        for element in spells:
            if str(element[year]): 
                overall += int(element[year])
                if element["Type"] == "Charm":
                    charm += int(element[year])
                elif element["Type"] == "Spell":
                    spell += int(element[year])
                elif element["Type"] == "Curse":
                    curse += int(element[year])
                elif element["Type"] == "Unforgivable Curse":
                    unforg += int(element[year])

        data.append(tuple([year] + [overall] + [charm] + [spell] + [curse] + [unforg]))

    mylib.into_csv(data, "../Data/Background/csv/bardata.csv")


def main():

    create_bardata()

if __name__ == '__main__':
    main()