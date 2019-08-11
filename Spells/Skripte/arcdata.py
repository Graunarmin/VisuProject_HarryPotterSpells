import json
import pickle

def create_arcdata():
    
    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    nodes = []
    linkliste = {}
    links = []
    types = {}
    years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07']

    for year in years:
        for element in spells:
            if str(element[year]):
                #add all nodes (each spell per each year)
                nodes.append({"spell":element["Spell"],"name":element["Short"]+"_"+year, "size":element[year],
                            "type":element["Type"].replace(" ",""), "category":element["Category"], "danger":element["Danger"],
                            "id":element["Short"]+"_"+year})
                
                #add all necessary links:
                if element["Short"] not in linkliste:
                    linkliste[element["Short"]] = []
                    types[element["Short"]] = element["Type"].replace(" ","")

                linkliste[element["Short"]].append(element["Short"]+"_"+year) 
    
    #create the links
    for spell in linkliste:
        link = linkliste[spell]
        for i in range(len(link)-1):
            for j in range(i+1,len(link)):
                links.append({"source":link[i],"target":link[j],"type":types[spell]})
    
    #join data
    data = {"nodes":nodes,"links":links}
    
    #save as pickle ...
    pickle.dump(data, open("../Pickles/arcdata.p", "wb"))
    
    #...and as json
    json_string = json.dumps(data)
    json.dump(data, open('../Data/Background/json/arcdata.json', 'w'))

def main():
    
    create_arcdata()

if __name__ == '__main__':
    main()