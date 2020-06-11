from numpy import nan
with open("manager8_output.txt", "r") as file:
    cluster = eval(file.readline())
newCluster=[]
for elem in cluster:
    v=list(elem.values())
    newCluster.append({list(elem.keys())[0]:(v[0][0],v[0][1])})
with open("datiPreparati.txt", "w") as file:
    file.write(str(newCluster))