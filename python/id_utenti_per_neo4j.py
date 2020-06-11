import pandas as pd

df=pd.read_csv('csv_file/relational/tabellaUtenti.csv')

df2=df[['CustomerID']]
df2.to_csv('idUtentiPerNeo4j.csv',index=False,encoding = "utf-8")