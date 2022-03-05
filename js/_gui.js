let ShortList = class {
    constructor(div, cfg, funs = {}, obj_) {
        this.div = div
        this.cfg = cfg.cfg
        this.item = cfg.item
        this.funs = funs
        this.refresh()
        this.ctrl_ = obj_.ctrl
    }
    refresh() {
        this.data = this.funs.data()
        var item = this.item
        var thisFuns = this.funs
        var crtl_ = this.ctrl_
        var row = d3.select(this.div)
            .html("")
            .selectAll("div")
            .data(this.data)
            .enter().append("div")
            // .attr("class", 'tagOk')
            .attr("class", function (d) { return (d[item.cssBy]) ? ('tag_' + d[item.cssBy] + ' tagOk') : 'tagOk' });
        if (this.cfg.includes('sign')) {
            row.append("span")                                        // for sign [+] or [-] 
                .text("[+/")
                .attr("class", 'tagSignP')
                .attr("title", 'click to toggle the sign')
                .on("click", function (d) {
                    d = d[item.txt]
                    if (this.innerText == '[+/') {
                        this.innerText = '[-/';
                        this.setAttribute("class", "tagSignN")
                        crtl_.shortList.neg.push(d)                            // push in
                    } else {
                        this.innerText = '[+/';
                        this.setAttribute("class", "tagSignP")
                        crtl_.shortList.neg = crtl_.shortList.neg.filter(e => e !== d); //in, move out
                    }
                    // refreshChart()
                })
        }
        if (this.cfg.includes('abs')) {
            row.append("span")                                        // for sign [+] or [-] 
                .text("abs/")
                .attr("class", 'tagAbsN')
                .attr("title", 'click to toggle the ABS')
                .on("click", function (d) {
                    d = d[item.txt]
                    if (this.innerText == 'abs/') {
                        this.innerText = 'ABS/';
                        this.setAttribute("class", "tagAbsY")
                        crtl_.shortList.abs.push(d)                            // push in
                    } else {
                        this.innerText = 'abs/';
                        this.setAttribute("class", "tagAbsN")
                        crtl_.shortList.abs = crtl_.shortList.abs.filter(e => e !== d); //in, move out
                    }
                    refreshChart()
                })
        }
        if (this.cfg.includes('axis')) {
            row.append("span")                                        // for sign [+] or [-] 
                .text("L]")
                .attr("class", 'tagAxisL')
                .attr("title", 'click to toggle the axis')
                .on("click", function (d) {
                    d = d[item.txt]
                    if (this.innerText == 'L]') {
                        this.innerText = 'R]';
                        this.setAttribute("class", "tagAxisR")
                        crtl_.shortList.axisR.push(d)                            // push in
                    } else {
                        this.innerText = 'L]';
                        this.setAttribute("class", "tagAxisL")
                        crtl_.shortList.axisR = crtl_.shortList.axisR.filter(e => e !== d); //in, move out
                    }
                    refreshChart()
                })
        }
        row.append("span")                                        // for each measure toggle 
            .attr("title", 'click on tag to toggle between in or out')
            .attr("class", function (d) {
                d = d[item.txt]
                return crtl_.shortList.on.includes(d) ? "tagOn" : "tagOff";
            })
            .on("click", function (d) { thisFuns.click(this, d) })
            .on("mouseover", function (d) { thisFuns.mouseover(d) })
            .on("mouseout", function (d) { thisFuns.mouseout(d) })
            .text(function (d, i) { return d[item.txt] })
    }
}

let GUI = class {
    constructor(div, cfg, fun = {}, ctrl_) {
        this.dom = {}
        this.js = {
            div: div,
            fun: fun,
            ctrl: {}
        }
        this.ctrl = ctrl_
        // var thisDOM = this.dom
        // var thisJS = this.js
        var ctnr = document.querySelector(div)
        Object.keys(cfg).forEach(k => {
            var item = cfg[k]
            var elm = document.createElement(item.type.split('.')[0])  // example: "input.date"
            if (item.hide) elm.hidden = true
            if (item.style) elm.style = item.style
            switch (item.type) {
                case 'input.date':  // <input type="date" id="time0_2" onchange="autoItv(1,'_2')" value="2020-01-01" style="width: 9em">
                    elm.type = 'date'
                    elm.value = item.value
                    this.js.ctrl[k] = item.value
                    this.js.ctrl[k + 'v'] = new Date(this.js.ctrl[k] + ' ').getTime()
                    if (item.onchange) {
                        elm.onchange = (e) => { item.onchange(e) }
                    } else {
                        elm.onchange = (e) => {
                            this.js.ctrl[k] = e.target.value;
                            this.js.ctrl[k + 'v'] = new Date(this.js.ctrl[k] + ' ').getTime()
                            this.js.fun.trigger(this)
                        }
                    }
                    break;
                case 'input.time':  // <input type="date" id="time0_2" onchange="autoItv(1,'_2')" value="2020-01-01" style="width: 9em">
                    elm.type = 'time'
                    elm.value = item.value
                    this.js.ctrl[k] = item.value
                    this.js.ctrl[k + 'v'] = new Date(item.value).getTime()
                    elm.onchange = (e) => { item.onchange(e) }
                    break;
                case 'input.checkbox':
                    elm.type = 'checkbox'
                    elm.checked = item.checked
                    this.js.ctrl[k] = item.checked == 'checked' ? true : false
                    elm.onchange = item.onchange
                    break
                case 'input.text':
                    elm.type = 'text'
                    elm.value = item.value
                    elm.size = item.size
                    elm.placeholder = item.placeholder
                    elm.oninput = item.oninput
                    this.js.ctrl[k] = item.value
                    this.js.ctrl[k + 'v'] = item.value.split(':').reduce((acc, time) => (60 * acc) + +time) * 1000
                    break
                case 'select':
                    item.option.forEach(opt => {
                        var option = document.createElement("option")
                        if (opt[0] == '*') {
                            option.selected = "selected"
                            opt = opt.slice(1)
                            this.js.ctrl[k] = opt
                        }
                        option.text = opt
                        elm.add(option)
                    })
                    elm.onchange = (e) => { this.js.ctrl[k] = e.target.value; this.js.fun.trigger(this) }
                    break;
                case 'button':  // <button id='saveCSV_2' onclick="saveCSV2()" title="select time-series data to export">csv</button>
                    elm.textContent = k
                    elm.onclick = (e) => {
                        var onID = e.target.parentElement.id
                        if (item.onclick.typeID) {
                            var typeID = onID + '__' + item.onclick.typeID
                            typeID = document.querySelector('#' + typeID).value
                        }
                        onID = onID + '__' + item.onclick.onID
                        item.onclick.fun(onID, typeID)
                    }
                    break;
                case 'div.plotly':
                    break;
                case 'label':
                    elm['innerHTML'] = item['innerHTML']
                    elm.setAttribute("for", item['for'])                    
                     break;
                default:
                    Object.keys(item).forEach(k => {
                        if (k = ! 'type') elm[k] = item[k]
                    })
            }
            if (item.div) {
                var ctnr1 = document.querySelector(item.div)
                ctnr1.append(elm)   
                elm.id = ctnr1.id + '__' + k             
            } else {
                ctnr.append(elm)
                elm.id = ctnr.id + '__' + k                
            }
            this.dom[k] = elm
        })
        // document.addEventListener(evt.name, evt.fun(this));        
    }
    refresh() {
    }
}
