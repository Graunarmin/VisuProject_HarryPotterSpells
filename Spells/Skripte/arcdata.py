import json
import pickle

def create_arcdata():
    
    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    nodes = []
    linkliste = {}
    links = []
    years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07']

    for year in years:

        for element in spells:
            if str(element[year]):
                #add all nodes (each spell per each year)
                nodes.append({"spell":element["Spell"],"name":element["Short"]+"_"+year, "size":element[year],
                            "type":element["Type"], "category":element["Category"], "danger":element["Danger"],
                            "id":element["Short"]+"_"+year})
                
                #add all necessary links:
                if element["Short"] not in linkliste:
                    linkliste[element["Short"]] = []

                linkliste[element["Short"]].append(element["Short"]+"_"+year) 

    #create the links
    for spell in linkliste:
        link = linkliste[spell]
        for i in range(len(link)-1):
            links.append({"source":link[i],"target":link[i+1],"value":1})
    
    
    data = {"nodes":nodes,"links":links}

    pickle.dump(data, open("../Pickles/arcdata.p", "wb"))

    json_string = json.dumps(data)
    json.dump(data, open('../Data/Background/json/arcdata.json', 'w'))

def main():
    
    create_arcdata()

if __name__ == '__main__':
    main()