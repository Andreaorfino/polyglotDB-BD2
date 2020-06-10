import json
import pandas as pd
import random
import numpy as np
from numpy import nan
df = pd.read_csv('csv_file/data.csv', encoding ="ISO-8859-1")
df=df.dropna()
with open("datiPreparati.txt", "r") as file:
    features = eval(file.readline())

class App(dict):
    def __str__(self):
        return json.dumps(self)

df2=df[['StockCode','UnitPrice']].drop_duplicates(subset='StockCode',keep='first')
jsonList=[]
maxAttributi=10
for i,row in df2.iterrows():
    jsonRow=[['StockCode',row['StockCode']],['UnitPrice',row['UnitPrice']]]
    numeroArrtibuti=random.randint(1,maxAttributi)
    subsetFeatures = random.sample(features, numeroArrtibuti)
    for elem in subsetFeatures:
        v=list(elem.values())
        attributo=[random.choice(list(v[0][0])),random.choice(list(v[0][1]))]
        if not pd.isna(attributo[1]):
            jsonRow.append(attributo)
    jsonList.append(App(jsonRow))
    print(App(jsonRow))
with open("csv_file/noSQL/json_Mongo_DB.json", "w") as file:
    json.dump(jsonList, file)

