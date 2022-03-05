## ====== Server code, host, port
import sys
print ("This is the name of the script: ", sys.argv[0])
print ("Number of arguments: ", len(sys.argv))
print ("The arguments are: " , str(sys.argv))
if len(sys.argv) == 3 :          # ./python serv2020.py 0.0.0.0 8008
    HOST = sys.argv[1]
    PORT = int(sys.argv[2])
elif len(sys.argv) == 2:         # ./python serv2020.py 8008
    HOST = "0.0.0.0"
    PORT = int(sys.argv[1])
else:                            # ./python serv2020.py
    HOST = "0.0.0.0"
    PORT = 8018
## required lib
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
from datetime import datetime

# from scipy.io import loadmat
# from random import randrange

## ====== initial data
import initData                  # user lib for data read / write 

## ====== the Data Server: GET / POST responses
class Serv(BaseHTTPRequestHandler):
    global dataTag, df_dataN, data_t0, data_itvl, tagList, tagList_, dataSpaAgg #, tagMap, tagType
    def end_headers (self):   #Enable access control on simple HTTP server from: https://stackoverflow.com/questions/21956683/enable-access-control-on-simple-http-server
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)
    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
    # do_GET, Check the URI of the request to serve the proper content.
    def do_GET(self):
        with open("./log/PyWeb.log", "a") as myfile:         # log 
            myfile.write(self.client_address[0] + "," + datetime.now().strftime("%Y/%m/%d,%H:%M:%S") + "," + self.path + "\n")
        # print ("=======" + self.client_address[0] + "," + datetime.now().strftime("%Y/%m/%d, %H:%M:%S") + "," + self.path)
        content = {'content': ''}
        if "ajax_tceFacility" in self.path :        
            dataFclt = initData.jsonData('tceFacility.json')  # dataFclt = initData.fcltCost()
            content = {'fclt':dataFclt} # content = {site : weprogID}
        if "ajax_tceAll" in self.path :        
            dataFclt = initData.jsonData('tceFacility.json')  # dataFclt = initData.fcltCost()
            dataPrj = initData.jsonData('tceProject.json')  
            dataScn = initData.jsonData('tceScenario.json')  
            content = {'fclt':dataFclt, 'prj': dataPrj, 'scn': dataScn}      # 
        # if 'empty' not in content.keys():                    # no respond for 'empty' 
        self.respond(content)                            # we can retrieve response within this scope and then pass info to self.respond

    def do_POST(self):
        with open("./log/PyWeb.log", "a") as myfile:         # log 
            myfile.write(self.client_address[0] + "," + datetime.now().strftime("%Y/%m/%d,%H:%M:%S") + "," + self.path + "\n")        
        global tagList_, dataSpaAgg, tagMap, tagType, tagMask
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        self.data_json = json.loads(self.data_string)
        self.send_response(200)
        self.end_headers()
        if "ajax_tceFacility" in self.path:     # for cost facility scenario data
            outFile = "tceFacility.json"
        if "ajax_tceProject" in self.path:      # for cost project scenario data
            outFile = "tceProject.json"
        if "ajax_tceScenario" in self.path:      # for cost project scenario data
            outFile = "tceScenario.json"
        ## post data precessing
        with open(outFile, "w") as outfile:
            json.dump(self.data_json, outfile)
    # store response for delivery back to client. This is good to do so the user has a way of knowing what the server's response was.
    def respond(self, data):
        response = self.handle_http(data)
        self.wfile.write(response)
    def handle_http(self, data):
        self.send_response(200)
        # set the data type for the response header. In this case it will be json.
        # setting these headers is important for the browser to know what to do with the response. Browsers can be very picky this way.
        self.send_header('Content-type', 'application/json')
        self.end_headers()       
        json_string = json.dumps(data)
        return json_string.encode(encoding='utf_8')
        # return bytes(data, 'UTF-8') # not working for json
        # return bytes(data) # working for py2.7 SimpleHTTPRequestHandler even for json

## ====== start the Data server
httpd = HTTPServer((HOST, PORT), Serv)
httpd.serve_forever()
print ("serving at http://prodhpcts01:",+PORT)
