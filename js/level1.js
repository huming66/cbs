// $(function () {
// });
// pre defined component
function component_fcTree() {                                          // [1]. Fancy table setup
  $("#tree11").fancytree({  // 1.1 Define fancy table
    selectMode: 3,          // chain-select (3), single-select (1)
    checkbox: true,
    checkboxAutoHide: false,
    titlesTabbable: true,   // Add all node titles to TAB chain
    quicksearch: true,      // Jump to nodes when pressing first character
    extensions: ["table", "edit"],
    table: {
      indentation: 10,      // indent 20px per node level
      nodeColumnIdx: 2,     // render the node title into the 2nd column
      checkboxColumnIdx: 1  // render the checkboxes into the 1st column
    },
    edit: {
      triggerStart: ["clickActive", "dblclick", "f2", "mac+enter", "shift+click"],
      beforeEdit: function (event, data) {
        // Return false to prevent edit mode
        a = 1
      },
      edit: function (event, data) {
        // Editor was opened (available as data.input)
      },
      beforeClose: function (event, data) {
        // Return false to prevent cancel/save (data.input is available)
        console.log(event.type, event, data);
        if (data.originalEvent.type === "mousedown") {
          // We could prevent the mouse click from generating a blur event
          // (which would then again close the editor) and return `false` to keep
          // the editor open:
          //                  data.originalEvent.preventDefault();
          //                  return false;
          // Or go on with closing the editor, but discard any changes:
          //                  data.save = false;
        }
      },
      save: function (event, data) {
        // Save data.input.val() or return false to keep editor open
        console.log("save...", this, data);
        // Simulate to start a slow ajax request...
        setTimeout(function () {
          $(data.node.span).removeClass("pending");
          // Let's pretend the server returned a slightly modified
          // title:
          data.node.setTitle(data.node.title + "!");
        }, 2000);
        // We return true, so ext-edit will set the current user input
        // as title
        return true;
      },
      close: function (event, data) {
        // Editor was removed
        if (data.save) {
          // Since we started an async request, mark the node as preliminary
          $(data.node.span).addClass("pending");
        }
      }
    },
    source: arr2fancyTree(spa.xls, ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'], ['id', 'Unit Price', 'Material', 'Labour', 'Other', 'Unit']),
    renderColumns: function (event, data) {
      var node = data.node;
      $tdList = $(node.tr).find(">td");
      $tdList.eq(0).text(node.getIndexHier());
      // (index #1 is rendered by fancytree by adding the checkbox)
      // (index #2 is rendered by fancytree)

      if ($("#readOnly").prop("checked")) {
        // $tdList.eq(3).text(node.data['Unit Price']?.toLocaleString());
        // if (node.data.Unit) {
        //   $tdList.eq(4).html(`<input name="input1" type="text" value="${node.data.Unit}"/>`)
        // }
        // $tdList.eq(4).text(node.data.Unit);  // $tdList.eq(4).find("input").val(node.data.Unit);
        // $tdList.eq(5).text(node.data.Material);
        // $tdList.eq(6).text(node.data.Labour);
        // $tdList.eq(7).text(node.data.Other);
      } else {
        if (node.getLevel() == 5) {  //node.getChildren()
          $tdList.eq(3).html(`<input name="input1" type="text" id = "${node.data.id}" onchange="editLv1(this)" style="width:100px" value="${node.data['Unit Price']?.toLocaleString()}"/>`)
          $tdList.eq(4).html(`<input name="input2" type="text" style="width: 60px" value="${node.data.Unit}"/>`)
          $tdList.eq(5).html(`<input name="input3" type="text" style="width: 80px" value="${node.data.Material}"/>`)
          $tdList.eq(6).html(`<input name="input4" type="text" style="width: 80px" value="${node.data.Labour}"/>`)
          $tdList.eq(7).html(`<input name="input5" type="text" style="width: 80px" value="${node.data.Other}"/>`)
        }
      }




      // Rendered by row template:
      //        $tdList.eq(4).html("<input type='checkbox' name='like' value='" + node.key + "'>");
    },
    // activate: function(event, data){
    //   // A node was activated: display its title:
    //   var node = data.node;
    //   $("#echoActive").text(node.title);
    // },
    select: function (event, data) {
      // spa.list.cmp 
      spa.guiFclt.ctrl.shortList.all = $("#tree11").fancytree('getTree').getSelectedNodes().map(v => v.data.id).filter(v => v)
      spa.cmpList.refresh()   // ****
      // $("#msg").text(spa.list.cmp);
      // $("#msg").text(event.type + ": " + data.node.isSelected() + " " + data.node);
    },
    // beforeSelect: function(event, data){
    //   // A node is about to be selected: prevent this for folders:
    //   if( data.node.isFolder() ){
    //     return false;
    //   }
    // }
  });
}
function searchCmp() {
  spa.guiFclt.ctrl.searchTxt = document.getElementById('cmpFind__serchTxt').value
  spa.cmpList.refresh()  // ****
}

function lv1_GUI() {                                           // 0. main
  // action dropdown  // facility item dropdown  // facility note
  var cfg_ctrlGUI = {
    serchTxt: { div: '#cmpFind', type: 'input.text', value: '', size: '10', placeholder:"search ...", 
    oninput: searchCmp, 
  },
    fcltAction: { type: 'select', option: ['*...', 'add', 'remove', 'save'] },
    fcltList: { type: 'select', option: ['*...'] },
    fcltTxt: { type: 'input.text', value: '...', size: '25' },
    csv2: { type: 'button', onclick: { fun: saveCSV_, onID: 'cht2', typeID: 'type2' }, style: '' },
    viz2: { type: 'button', onclick: { fun: savePlotlyHTml, onID: 'cht2' }, style: '' },
    //         br1 : {type: 'br'},
    //         cht2 : {type: 'div.plotly', style:"display:block;float:right;width:100%;margin-left:0px;height:40%;background:#edf;"},
  }
  var fun_ctrlGUI = {
    trigger: (_this = '') => {
      var cfg = _this.ctrl
    }
  }
  var ctrlExt0 = {     // /// external config & re-mapping
    shortList: {all: [], on: [], neg: [], axisR: [], abs: []},
    searchTxt: ''
  }
  spa.guiFclt = new GUI('#fclt', cfg_ctrlGUI, fun_ctrlGUI, ctrlExt0)
  var ctrlExt = spa.guiFclt.ctrl
  var cfg_itemList = {    // short list
    cfg: ['_sign', '_axis', '_abs'],
    item: { txt: 'L2_5', cssBy: 'Material' }  // txt: shorList, cssBy: for css control by class name
  }
  ctrlExt.shortList.on = []
  let fun_itemList = {               // addng  functions
    data: () => {
      var list = spa.guiFclt.ctrl.shortList.all
      if (ctrlExt.searchTxt != '') {
        var txt = ctrlExt.searchTxt.replace('*','.*')
        var ptn = (txt[0] =='/') ? txt : new RegExp(txt,'i') 
        list = list.filter(v => v.match(ptn))                            // ****
      } 
      return list ? spa.xls.filter(v => list.includes(v.id)) : []  // ****
    },
    click: (obj, d) => {
      d = d['L2_5']
      if (ctrlExt.shortList.on.includes(d)) {
        ctrlExt.shortList.on = ctrlExt.shortList.on.filter(e => e !== d); // in, move out
        obj.setAttribute("class", "tagOff")
      } else {
        ctrlExt.shortList.on.push(d)                           // not in, push in
        // ctrlExt.shortList.on.sort()                            // re-order to ensure the same order
        obj.setAttribute("class", "tagOn")
      }
      // fun_ctrlGUI.trigger(spa.chtUTL1)  // this.funs.click()
    },
    mouseover: function (d) {
      $('#addInfo').css('display', 'block')
      var html = `<span id='close' onclick="$('#addInfo').css('display','none')">x</span>` + ' <b>' + d.id + '</b><br>';
      if (d['User Guide'] != undefined) html = html + 'User Guide: <k3>' + d['User Guide'] + '</k3><br>';
      html = html + 'Unit Price: <k3>$' + d['Unit Price'].toLocaleString() + ' </k3>' + d['Unit'] + '<br>';
      html = html + 'Cost Type: <k3>' + d['group_3'] +'</k3>';
      if (d['picture']) {
        html = html + "<div style = 'text-align:center'><img id = 'infoPicture' src='" + spa.path + "./xls/Application Reference/picture/" + d['picture'] + "'></div>"
      }
      $("#addInfo").html(html)
    }, // itm.setAttribute('onmouseover', "titleDetails(this.__data__)");
    mouseout: function (d) {}, //{ $('#addInfo').css('display', 'none') },
    // refresh: fun_ctrlGUI.trigger
  }
  spa.cmpList  = new ShortList('#cmpList', cfg_itemList, fun_itemList, spa.guiFclt)
  component_fcTree()     // component treeTable
    // cashflow tree


    // action dropdown
    // facility item dropdown
    // facility note
    // export csv button, export html button
    // cost breakdown tree table
}


function reload_fcTree(tree = 'tree11') {                      // Fun: table reload 
  $("#" + tree).fancytree('getTree').reload()                    // change table between mode
  document.getElementById(tree).classList.toggle("hide")       // hide data for read-only
}
function editLv1(fromThis) {                                   // Fun: table data edit 
  var colMap = {                                               // map columns between table & data (spa.xls)
    'input1': ['Unit Price', (v) => { return v.replace(/\,/g, '') }],
    'input2': ['Unit'],
    'input3': ['Material', (v) => { return v * 1 }],
    'input4': ['Labour', (v) => { return v * 1 }],
    'input5': ['Other', (v) => { return v * 1 }],
  }
  var colName = colMap(fromThis.name)
  var colVal = colName[1] ? colName[1](fromThis.value) : fromThis.value
  spa.xls.find(v => v.id == fromThis.id)[colName[0]] = colVal
}
function saveCSV_() {

}
function savePlotlyHTml() { 
}