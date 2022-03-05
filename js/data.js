

spa = {
    xls: [],
    xls0: {},
    list: {}
    // hmTab:'lv1'
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var costB = getUrlVars()["b"];    //data csv file
if (costB == undefined ) {
    costB="UnitCost";
} else {
    if (!costB.includes("UnitCost_")) costB="UnitCost_"+costB;
} 

function getData() {
    $.ajax({
        // url: "http://prodhpcts01:8018/ajax_tceFacility?json=tceFacility",
        url: "http://192.168.12.3:8018/ajax_tceAll",
        method: "GET",
        success: function (d) {
            spa['fclt'] = d.fclt;
            spa['prj'] = d.prj; 
            spa['scn'] = d.scn; 
            // document.dispatchEvent(new CustomEvent("reChart", { "detail": "charting after getting new data" }));  //raise event for refresh bySite chart for history data
            $('#msg').html(new Date().toLocaleTimeString() + ' --- Data Returned for [' + 'estimate' + ']' + '<br>' + $('#msg').html())
            // $("#tab_1")[0].click() //$("#tab")[0].children[0].onclick()           // select facility tab
            // var urlF = getUrlVars()["f"];               // select facility
            // urlF = Object.keys(spa.fclt).indexOf(initF)
            // if (urlF == undefined) {
            //     $('#fcltSelect')[0].selectedIndex = 1
            // } else {
            //     $("#fcltSelect option").each(function () {
            //         if ($(this).text() == urlF) {
            //             $(this).attr("selected", "selected");
            //         }
            //     });   
            // }
            // setTimeout(function () { fcltUpd()}, 1500)
            // upd_treeGrid()
        },
        error: function (d) {
            spa.nTrace--;                       //number of unfinished traces
            $('#msg').html('!!! Error !!! for [' + 'site' + '] history data' + '<br>' + $('#msg').html())
        }
    })    
    xlsReader() // read xls and setTree()  
    // upd_treeGrid()
    // setTimeout(function () {setTrees()}, 200) // setTrees();// initial set up of trees moved into xlsReader()
}
$(window).on('load', function() {
    $("#tableTemplate").load("table_template.html")
    setTimeout(function(){ 
        var temp = document.getElementById("_ft_component")
        var clon = temp.content.cloneNode(true);
        document.getElementById("ft_component").appendChild(clon)
        getData()
    }, 100);

});

document.addEventListener("reChart", function () {         // handle raised event for reChart 
    if (spa.nTrace == 0) { reChart([1]) }                  // only for the bySite chart [1], as default 
});

function xlsReader(url = "./xls/"+ costB +".xlsx") {
    /* set up XMLHttpRequest */
    // var url = "http://myclassbook.org/wp-content/uploads/2017/12/Test.xlsx";
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (e) {
        var arraybuffer = oReq.response;
        /* convert data to binary string */
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");

        /* Call XLSX */
        var workbook = XLSX.read(bstr, {
            type: "binary"
        });

        /* DO SOMETHING WITH workbook HERE */
        // var first_sheet_name = workbook.SheetNames[0];
        // Get worksheet UnitCost
        var worksheet = workbook.Sheets['UnitCost'];
        // console.log(XLSX.utils.sheet_to_json(worksheet, {
        //     raw: true
        // }))
        spa.xls =  XLSX.utils.sheet_to_json(worksheet, {raw: true});
        spa.xls.forEach((d,i) => {
            var lv = [1, 2, 3, 4, 5]; var txt = '';
            lv.forEach(v => {
                if (d['Level ' + v] != undefined) {
                    txt += '|' + d['Level ' + v]
                }
            })
            spa.xls[i].id = txt
            var lv = [1, 2, 3]; var txt = '';
            lv.forEach(v => {
                if (d['Level ' + v] != undefined) {
                    txt += '|' + d['Level ' + v]
                }
            })
            spa.xls[i].L123 = txt
            var lv = [2, 3, 4, 5]; var txt = '';
            lv.forEach(v => {
                if (d['Level ' + v] != undefined) {
                    if (!txt.includes(d['Level ' + v])) txt += '|' + d['Level ' + v]
                }
            })
            spa.xls[i].L2_5 = txt

            spa.xls0[spa.xls[i].id] = spa.xls[i]; // keyed copy for easy reference by its Weprog_ID
        });

        var worksheet = workbook.Sheets['Cashflow'];
        spa.cashflow =  XLSX.utils.sheet_to_json(worksheet, {raw: true});
        spa.cashflow.forEach(d => {
            d.cashflow = []
            d.dscrpt = "[" + d.CF_ID + "." + d.CF_TYPE + "]:"
            Object.keys(d).forEach(k => {
                if (k.includes("Yr")) {
                    d.dscrpt = d.dscrpt + " / " + d[k]
                    d.cashflow.push(+d[k])
                }
            })
            d.dscrpt = d.dscrpt.replace(": /"," ")
        })

        // var cumulativeMlt = (sum => value => sum *= value)(1)
        var worksheet = workbook.Sheets['Inflation'];
        spa.inflation =  XLSX.utils.sheet_to_json(worksheet, {raw: true});    
        var ref_val = 1
        spa.inflation.forEach( (v,i) => {
            v.factor = (1 + v.inflation) * (i==0 ? 1 : spa.inflation[i-1].factor)
            if (v.ref_year == 1) ref_val = v.factor
        })  
        spa.inflation.forEach( (v,i) => {
            v.factor = v.factor / ref_val
        }) 
        setTimeout(function(){ lv1_GUI() }, 1000);
    }
    oReq.send();   
}

function saveHtmlViz(tGrid="treegrid") {
    tGrid="#"+tGrid
    var cdn = {}
    cdn.jQuery = '<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>' 
    cdn.plotly = ' <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>'
    cdn.d3     = ' <script src="https://syntagmatic.github.io/parallel-coordinates/examples/lib/d3.min.js"></script>'
    cdn.FileSaver = ' <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>'

    cdn.jqxCSS = '<link rel="stylesheet" href="http://prodhpcts01/lib/jqwidgets/styles/jqx.base.css" type="text/css" />'
    cdn.jqxCore = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxcore.js"></script>'
    cdn.jqxData = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxdata.js"></script>'
    cdn.jqxButtons = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxbuttons.js"></script>'
    cdn.jqxScrollbar = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxscrollbar.js"></script>'
    cdn.jqxDatatable = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxdatatable.js"></script>'
    cdn.jqxTreeGrid = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxtreegrid.js"></script>'
    cdn.jqxExport = '<script type="text/javascript" src="http://prodhpcts01/lib/jqwidgets/jqxdata.export.js"></script>'
    cdn.jQwidget = [cdn.jqxCSS, cdn.jqxCore, cdn.jqxData, cdn.jqxButtons, cdn.jqxScrollbar, cdn.jqxDatatable, cdn.jqxTreeGrid, cdn.jqxExport].join(' ')

    var html = '<html><head> ]cdn[ </head>\
    <body><div id="chart_2" style="height: 90%; width: 100%;" class="plotly-graph-div"></div> \
    <script> ]data[ </script> <script> ]viz[ </script> <script> ]saveFun[ </script></body> </html>' 

    // <button onclick="saveCSV2()" title="export data to CSV">export data to a csv file</button> \
    // html = html + " <script> " + saveCSV2.toString() + " </script>"`
    spa.vizTableData = {
        data              : $(tGrid).data().jqxTreeGrid.initArgs[0].source._source.localdata,
        dataFieldscolumns : $(tGrid).data().jqxTreeGrid.initArgs[0].source._source.datafields,
        columns           : $(tGrid).data().jqxTreeGrid.initArgs[0].columns
    }
    if (tGrid == "#treegrid") {
        spa.vizTableData.data[0].unitPrice = spa.vizTableData.data[0].unitPrice_adj = spa.vizTableData.data[0].unit 
        = spa.vizTableData.data[0].quantity = spa.vizTableData.data[0].note = ''
    } else if (tGrid == "#treegrid_prj") {
        if (!spa.vizTableData.data[0].isd) spa.vizTableData.data[0].isd=''
        if (!spa.vizTableData.data[0].factor) spa.vizTableData.data[0].factor=''
        if (!spa.vizTableData.data[0].note) spa.vizTableData.data[0].note=''
    } else if (tGrid == "#treegrid_scn") {
        if (!spa.vizTableData.data[0].isd) spa.vizTableData.data[0].isd=''
        if (!spa.vizTableData.data[0].cashflow) spa.vizTableData.data[0].cashflow=''
        if (!spa.vizTableData.data[0].note) spa.vizTableData.data[0].note=''        
        if (!spa.vizTableData.data[0].costC) spa.vizTableData.data[0].costC=''        
    }
    html = html.replace("]cdn[", cdn.jQuery + cdn.d3 + cdn.FileSaver + cdn.jQwidget)
    html = html.replace("]data[","vizTableData = JSON.parse('" +JSON.stringify(spa.vizTableData).replaceAll('\\"','') +"')")
    html = html.replace("]viz[", upd_treeGridHM.toString() +  "; upd_treeGridHM('#chart_2',vizTableData.dataFields, vizTableData.columns, vizTableData.data,true)")
    html = html.replace("]saveFun[","function saveCSV2() {$('#chart_2').jqxTreeGrid('exportData', 'csv','')}")
    // save var html as a html file
    var blob = new Blob([html], {type: "text/csv;charset=utf-8"});
    saveAs(blob, 'table_'+ d3.time.format("%Y%m%d%H%M%S")(new Date()) +'.html');	
}

function upd_treeGridHM(treegrid, data_dataFields, date_columns, data_data, open = false) {                     // Tree-grid refresh trigger by dropdown Menu
    var source = {
        dataType: "array",
        dataFields: data_dataFields,
        hierarchy: {
            keyDataField: { name: 'id' },
            parentDataField: { name: 'parentid'}
        },
        id: 'id',
        localData: data_data, 
    };
    var dataAdapter = new $.jqx.dataAdapter(source);    
    $(treegrid).jqxTreeGrid({   // create Tree Grid
        source: dataAdapter,
        sortable: true, 
        columnsResize: true,
        altRows: true, // autoRowHeight: true,
        columns: date_columns
    });
    if (open) $(treegrid).jqxTreeGrid('expandAll')
}

function tabChange() {
    spa.hmTab = $("input[type='radio'][name='hmTabs']:checked").val()
}

function arr2tree(arr,keyList, keyListD) {
    var tree = [];
    var vList 
    var k = keyList[0]; //var key = keyList[0]; //keys(arr[0]);
    vList = [...new Set(arr.map(obj => obj[k]))];
    vList.forEach((v,i) => { 
        if (keyList.length > 1) {
            tree.push({ 'text': v, 'type':k, 'children': [] });
            // var arr1 = arr.filter((value, index, self) => self[index][k] == v);
            var arr1 = arr.filter((value) => value[k] == v);  // self[index][k] is same as value[k]
            tree[i].children = arr2tree(arr1,keyList.slice(1,),keyListD);
        } else {
            if (keyListD == undefined) {
                tree.push({ 'text': v, 'type':k});
            } else {
                tree.push({ 'text': v, 'type':k, 'dscrpt':arr[i][keyListD]});
            }
        } 
    })
    return tree; 
} 

function arr2fancyTree(arr,keyList, keyListData) {
    var tree = [];
    var vList 
    var k = keyList[0]; //var key = keyList[0]; //keys(arr[0]);
    vList = [...new Set(arr.map(obj => obj[k]))];
    vList.forEach((v,i) => { 
        if (keyList.length > 1) {
            tree.push({ 'title': v, 'folder': true, 'children': [] });
            // var arr1 = arr.filter((value, index, self) => self[index][k] == v);
            var arr1 = arr.filter((value) => value[k] == v);  // self[index][k] is same as value[k]
            tree[i].children = arr2fancyTree(arr1,keyList.slice(1,),keyListData);
        } else {
            if (keyListData == undefined) {
                tree.push({ 'title': v});
            } else {
                var d = {'title': v}
                keyListData.forEach(k => {
                   d[k] = arr[i][k]
                })
                tree.push(d);
            }
        } 
    })
    return tree; 
} 

