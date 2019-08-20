import json
import csv
import pickle

def spells_to_html():
    
    spell_list = []
    html_list = []
    years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07']

    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    for element in spells:
        spell = str(element["Spell"])
        effect = str(element["Effect"])
        typ = str(element["Type"])
        short_type = typ
        if(typ == "Unforgivable Curse"):
            short_type = "UnforgivableCurse"
        category = str(element["Category"])
        danger = str(element["Danger"])
        link = element["Link"]
        overall = element["overall"]
        bookTags = ""
        
        #determine in which books the spell appears:
        #(Booklabels are 'Book 1', 'Book 2' etc. while atm the are 'HP_01', 'HP_02', etc.)
        for year in years:
            if element[year]:
                bookTags += str(year).replace("HP_0","Book ") + ","
        
        spell_list.append(spell)
        
        html_id = spell.split(" ")[0].lower()
        tmp = """
        <li class='spells {}' id='{}_spell'>
            <a class='toggleSpells'>{}</a>
            <ul class='info' id='{}_info'>
                <li class='effect' id='{}_effect'><span class='infoHead'>Effect </span><span class='infoContent'>{}</span></li>
                <li class='type' id='{}_type'><span class='infoHead'>Type </span><span class='infoContent'>{}</span></li>
                <li class='category' id='{}_category'><span class='infoHead'>Category </span><span class='infoContent'>{}</span></li>
                <li class='danger' id='{}_danger'><span class='infoHead'>Danger </span><span class='infoContent'>{}</span></li>
                <li class='overalluse' id='{}_overall'><span class='useInfo'>- Used {} times overall -</span></li>
                <li class='spellLink'><button class='tag link'><a href={} target='_blank'>More Details</a></button></li>
                <li class='bookTags'>{}</li>
            </ul>
        </li>"""

        html = tmp.format(short_type.lower(), html_id, spell, html_id, html_id, effect, html_id, typ, html_id, category, 
                          html_id, danger, html_id, overall, link, bookTags)
        html_list.append(html)

    with open('../Data/Background/html/spell_list.html', 'w') as f:
        for item in html_list:
            f.write("%s\n" % item)

def spell_csv_to_json(csv_path, json_path):
    data = []
    with open(csv_path, "r") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            dict = {}
            for key in row:
                dict[key] = row[key]
            data.append(dict)
    
    with open(json_path, 'w') as output:
        output.write(json.dumps(data, indent=4))

    pickle.dump(data, open("../Pickles/spells_final.p", "wb"))

def main():
    
    #spell_csv_to_json("../Data/used/spells.csv",'../Data/used/spells.json')
    spells_to_html()

if __name__ == '__main__':
    main()