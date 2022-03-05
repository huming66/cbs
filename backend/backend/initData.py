import json
def jsonData(f ='./tceFacility.json', d = 0, append = False):
    if d == 0 :
        with open(f) as obj:
            data = json.load(obj)
        return data  
    else :
        if append:
            with open(f,'r') as obj:
                data = json.load(obj)
                d = data+d
        with open(f,'w') as obj:   
            json.dump(d, obj, ensure_ascii=False, indent=0)