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
        
        spell_list.append(spell)
        
        html_id = spell.split(" ")[0].lower()
        tmp = """
        <li class='spells' id='{}'>
            <a class='toggleSpells'> {} </a>
            <ul class='info' display='none'>
                <li class='effect'> {} </li>
                <li class='type'> {} </li>
                <li class='category'> {} </li>
                <li class='danger'> {} </li>
            </ul>
        </li>"""

        html = tmp.format(html_id, spell, effect, typ, category, danger)
        html_list.append(html)

    with open('../Data/Background/html/spell_list_complete.html', 'w') as f:
        for item in html_list:
            f.write("%s\n" % item)

def csv_to_json(csv_path, json_path):
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
    
    #csv_to_json("../Data/used/spells.csv",'../Data/used/spells.json')
    spells_to_html()

if __name__ == '__main__':
    main()