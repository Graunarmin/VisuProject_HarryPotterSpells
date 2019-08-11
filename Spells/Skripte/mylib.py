import csv
import json

def into_csv(data, path):
    '''converts data row by row into csv'''
    with open(path, "w") as csvfile:

        writer = csv.writer(csvfile)

        for element in data:
            writer.writerow(element)

def load_json(file):
    '''loads json from file'''

    with open(file, "r") as jsonfile:
        data = json.load(jsonfile)

    return data