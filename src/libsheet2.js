'use strict';

var cellFuncs = [];

function cell(f) {
    cellFuncs.push(f);
}

function sheet(s) {
    return computeSheet(s, cellFuncs);
}


function cloneSheet(sheet) {
    var s = [];
    for (var i = 0; i < sheet.length; i++) {
        var obj = {};
        for (var k in sheet[i]) {
            if (sheet[i].hasOwnProperty(k)) {
                obj[k] = sheet[i][k];
            }
        }
        s.push(obj);
    }
    return s;
}

function propNames(obj) {
    var r = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            r.push(p);
        }
    }
    return r;
}

function subset(lst1, lst2) {
    for (var i = 0; i < lst1.length; i++) {
        if (lst2.indexOf(lst1[i]) === -1) {
            return false;
        }
    }
    return true;
}

function findConstructors(row, funcs) {
    var result = [];
    for (var j = 0; j < funcs.length; j++) {
        var fs = formals(funcs[j]);
        fs.shift();  // skip sheet
        //console.log(fs);
        var pns = propNames(row);
        if (fs.length == 0) {
           // special case empty: funcs[j].name must be in pns as marker
           if (pns.indexOf(funcs[j].name) > -1) {
             result.push(funcs[j]);
           }
           continue;
        }
        if (subset(fs, pns)) {
            result.push(funcs[j]);
        }
    }
    return result;
}


function formals(func) {
    var src = func.toString();
    var start = src.indexOf('(');
    var end = src.indexOf(')');
    var params = src.slice(start + 1, end);
    var result = [];
    params.split(',').forEach(function (x) { result.push(x.trim()); });
    return result;
}

function computeSheet(sheet, funcs) {

    // clone the input sheet so that we can add computed values.
    var newSheet = cloneSheet(sheet);

    var change = false;
    do {
        change = false;
        for (var i = 0; i < newSheet.length; i++) {
            var ctrs = findConstructors(newSheet[i], funcs);
            
            for (var j = 0; j < ctrs.length; j++) {
              var columns = formals(ctrs[j]);
              columns.shift(); // skip sheet

              var args = [newSheet].concat(columns.map(function (col) {
                 return newSheet[i][col];
              }));

              var val = ctrs[j].apply(undefined, args);
              if (typeof val === 'number' && isNaN(val)) {
                val = undefined;
              }
              var name = ctrs[j].name;
              if (newSheet[i].hasOwnProperty(name)) {
                 if (newSheet[i][name] !== val) {
                    newSheet[i][name] = val;
                    change = true;
                 }
              }
              else {
                newSheet[i][name] = val;
                change = true;
              }
            }
        }
    } while (change);
    //console.log(JSON.stringify(newSheet, null, 2));
    return newSheet;
}


function count(key, sheet) {
    var count = 0;
    sheet.forEach(function (r) {
        if (r.hasOwnProperty(key)) {
            count++;
        }
    });
    return count;
}

function avg(key, sheet) {
    var total = 0;
    var count = 0;
    sheet.forEach(function (r) {
        if (r.hasOwnProperty(key)) {
            total += r[key];
            count++;
        }
    });
    return total / count;
}


