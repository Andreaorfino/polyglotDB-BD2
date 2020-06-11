import pandas as pd
import random

maxAmicizie=8

df=pd.read_csv('csv_file/graph/idUtentiPerNeo4j.csv')

df2 = pd.DataFrame(columns=["IdAmicoFrom", "IdAmicoTo"])
listFrom=[]
listTo=[]
for i in range(len(df)):
    #print(i)
    amici=random.randint(1,maxAmicizie)
    for j in range(amici):
        index=random.randint(0,len(df)-1)
        listFrom.append(df['CustomerID'].loc[i])
        listTo.append(df['CustomerID'].loc[index])
        listFrom.append(df['CustomerID'].loc[index])
        listTo.append(df['CustomerID'].loc[i])
df2["IdAmicoFrom"]=listFrom
df2["IdAmicoTo"]=listTo
print(df2)
df2=df2[["IdAmicoFrom", "IdAmicoTo"]].drop_duplicates(keep='first')
df2.to_csv('relazioni_Neo4j.csv',index=False,encoding = "utf-8")
"""    
df = df.append({
     "firstname": "John",
     "lastname":  "Johny"
      }, ignore_index=True)"""