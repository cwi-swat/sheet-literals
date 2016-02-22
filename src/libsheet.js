'use strict';

var rowConstructors = [];

function row(f) {
    rowConstructors.push(f);
}

function sheet(s) {
    return computeSheet(s, rowConstructors);
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

function findConstructor(row, funcs) {
    nextFunc: for (var j = 0; j < funcs.length; j++) {
        var fs = formals(funcs[j]);
        fs.shift();  // skip sheet
        //console.log(fs);
        var pns = propNames(row);
        if (fs.length == 0) {
            // special case because subset is always true.
            var dummy = new funcs[j](undefined);
            for (var k = 0; k < pns.length; k++) {
                //console.log('propname: ' + pns[k]);
                if (!dummy.hasOwnProperty(pns[k])) {
                    continue nextFunc;
                }
            }
            return [funcs[j], []];
        }
        if (subset(fs, pns)) {
            return [funcs[j], fs];
        }
    }
    // return identity.
    return [function(sheet) {}, []];
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
            var conscol = findConstructor(newSheet[i], funcs);
            var cons = conscol[0], columns = conscol[1];

            //console.log(cons.name);
            //console.log('---> row ' + i + ' = ');
            //console.log(newSheet[i]);
            var args = [newSheet].concat(columns.map(function (col) {
                return newSheet[i][col];
            }));
            var realArgs = [null].concat(args);
            var factoryFunction = cons.bind.apply(cons, realArgs);
            var obj = new factoryFunction();

            for (var a in obj) {
                if (obj.hasOwnProperty(a)) {
                    if (typeof obj[a] === 'function') {
                        var val = obj[a].call(obj);
                        //console.log('computed: ' + val);
                        if (typeof val === 'number' && isNaN(val)) {
                            val = undefined;
                        }
                        if (newSheet[i].hasOwnProperty(a)) {
                            if (newSheet[i][a] !== val) {
                                newSheet[i][a] = val;
                                change = true;
                            }
                        }
                        else {
                            newSheet[i][a] = val;
                            change = true;
                        }
                    }
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


