import json
import csv
import pickle

def spells_to_html():
    
    spell_list = []
    html_list = []

    spells = pickle.load(open("../Pickles/spells_final.p", "rb"))
    for element in spells:
        spell = str(element["Spell"])
        effect = str(element["Effect"])
        typ = str(element["Type"])
        category = str(element["Category"])
        danger = str(element["Danger"])
        link = element["Link"]
        

        if danger == "0":
            danger = "Harmless"
        elif danger == "1":
            danger = "Harmful"
        elif danger == "2":
            danger = "Severe"
        elif danger == "3":
            danger = "Lethal"
        
        spell_list.append(spell)
        
        html_id = spell.split(" ")[0].lower()
        tmp = """
        <li class='spells' id='{}'>
            <a class='toggleSpells'>{}</a>
            <ul class='info' id='{}'>
                <li class='effect' id='{}Effect'><span class='infoHead'>Effect </span><span class='infoContent'>{}</span></li>
                <li class='type' id='{}Type'><span class='infoHead'>Type </span><span class='infoContent'>{}</span></li>
                <li class='category' id='{}Category'><span class='infoHead'>Category </span><span class='infoContent'>{}</span></li>
                <li class='danger'id='{}Danger'><span class='infoHead'>Danger </span><span class='infoContent'>{}</span></li>
                <li class='spellLink'><button class='tag link'><a href={} target='_blank'>More Details</a></button></li>
            </ul>
        </li>"""

        html = tmp.format(html_id, spell, html_id, html_id, effect, html_id, typ, html_id, category, html_id, danger, link)
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