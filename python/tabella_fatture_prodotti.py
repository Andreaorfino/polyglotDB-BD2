import pandas as pd
import random


df=pd.read_csv('csv_file/data.csv', encoding ="ISO-8859-1")
df=df.dropna()


df2=df[['InvoiceNo','StockCode','Quantity']].drop_duplicates(keep='first')
df2=df2.astype({'Quantity': 'int32'})


df2.to_csv('tabellaFattureProdotti.csv',index=False,encoding = "utf-8")