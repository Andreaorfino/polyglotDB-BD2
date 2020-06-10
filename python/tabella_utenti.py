import pandas as pd
import random


df=pd.read_csv('csv_file/data.csv', encoding ="ISO-8859-1")
df=df.dropna()
genere=['male','female']

df2=df[['CustomerID','Country']].drop_duplicates(keep='first')
df2=df2.astype({'CustomerID': 'int32'})
listaSessi=[]
for i in range(len(df2)):
    x=random.random()
    if x>0.5:
        x=1
    else:
        x=0
    listaSessi.append(genere[x])
df2['Sesso']=listaSessi
df2.to_csv('tabellaUtenti.csv',index=False,encoding = "utf-8")