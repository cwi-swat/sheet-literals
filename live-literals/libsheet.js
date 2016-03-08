'use strict';

var cellFuncs = [];

function cell(f) {
    cellFuncs.push(f);
}

function sheet(s) {
    console.log("Evaluating sheet");
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


function traverse(node, func) {
    func(node);//1
    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //4

                if (Array.isArray(child)) {
                    child.forEach(function(node) { //5
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func); //6
                }
            }
        }
    }
}

function findSheet(tree) {
    var found;
    traverse(tree, function(x) {
        if (x.type === 'CallExpression' && x.callee.name === 'sheet') {
            found = x;
        }
    });
    return found;
}

function test(specs) {
    console.log('returning test func');
    return function (func) {
        var fs = formals(func);
        var s = cloneSheet(specs);
        for (var i = 0; i < s.length; i++) {
            var args = [];
            for (var j = 0; j < fs.length; j++) {
                if (s[i].hasOwnProperty(fs[j])) {
                    args.push(s[i][fs[j]]);
                }
                else {
                    // or invent a value...
                    args.push(undefined);
                }
            }
            var result = func.apply(undefined, args);
            if (s[i].hasOwnProperty('should')) {
                s[i].result = result === s[i].should;
            }
            else {
                s[i].result = result;
            }
        }
        return s;
    };
}

function findTests(tree) {
    var found = [];
    traverse(tree, function(x) {
        if (x.type === 'FunctionDeclaration' ) {
            if (x.body.body[0].type === 'ExpressionStatement'
                && x.body.body[0].expression.type === 'CallExpression'
                && x.body.body[0].expression.callee.name === 'test') {
                found.push({name: x.id.name, test: x.body.body[0].expression});
            }
        }
    });
    return found;
}

function findRuns(tree) {
    var found = [];
    traverse(tree, function(x) {
        if (x.type === 'FunctionDeclaration' ) {
            if (x.body.body[0].type === 'ExpressionStatement'
                && x.body.body[0].expression.type === 'CallExpression'
                && x.body.body[0].expression.callee.name === 'run') {
                found.push({name: x.id.name, run: x.body.body[0].expression});
            }
        }
    });
    return found;
}


function patchLiteral(ast, val, patch) {
    for (var i = 0; i < ast.elements.length; i++) {
        var row = ast.elements[i];
        //console.log('row = ' + i + ': ' + JSON.stringify(row));
        var newRow = val[i];
        for (var j = 0; j < row.properties.length; j++) {
            var prop = row.properties[j];
            for (var k in newRow) {
                if (newRow.hasOwnProperty(k)) {
                    if (prop.key.name === k) {
                        if (!prop.value.computed && prop.value.value !== newRow[k]) {
                            console.log('original: ' + prop.value.value);
                            console.log('new: ' + newRow[k]);
                            
                            patch.push({range: prop.value.range,
                                        loc: prop.value.loc,
                                        value: newRow[k]});
                        }
                    }
                }
            }
        }
        for (var k in newRow) {
            if (newRow.hasOwnProperty(k)) {
                var found = false;
                for (var j = 0; j < row.properties.length; j++) {
                    if (row.properties[j].key.name === k) {
                        found = true;
                    }
                }
                if (!found) {
                    patch.push({range: [row.range[1] - 1, row.range[1] - 1],
                                loc: undefined,
                                value: ', ' + k + ': ' + newRow[k]});
                }
            }
        }
    }
}


function patchTest(tree, lit, specs) {
    var patch = [];
    traverse(tree, function(x) {
        if (x.type === 'FunctionDeclaration' ) {
            if (x.body.body[0].type === 'ExpressionStatement'
                && x.body.body[0].expression.type === 'CallExpression'
                && x.body.body[0].expression.callee.name === 'test'
                && x.body.body[0].expression.range[0] === lit.range[0]) {
                var it = x.body.body[0].expression.arguments[0];
                patchLiteral(it, specs, patch);
            }
        }
    });
    return patch;
}


function patchSheet(tree, rows) {
    var patch = [];
    traverse(tree, function(x) {
        if (x.type === 'CallExpression' && x.callee.name === 'sheet') {
            for (var i = 0; i < x.arguments[0].elements.length; i++) {
                var row = x.arguments[0].elements[i];
                for (var j = 0; j < row.properties.length; j++) {
                    var prop = row.properties[j];
                    var newRow = rows[i];
                    for (var k in newRow) {
                        if (newRow.hasOwnProperty(k)) {
                            if (prop.key.name === k) {
                                if (!prop.value.computed && prop.value.value !== newRow[k]) {
                                    console.log('original: ' + prop.value.value);
                                    console.log('new: ' + newRow[k]);

                                    patch.push({range: prop.value.range,
                                                loc: prop.value.loc,
                                                value: newRow[k]});
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return patch;
}

function run(spec) {
    console.log('returning run func');
    return function (func) {
        var fs = formals(func);
        var args = [];
        for (var j = 0; j < fs.length; j++) {
            if (spec.hasOwnProperty(fs[j])) {
                args.push(spec[fs[j]]);
            }
            else {
                // or invent a value...
                args.push(undefined);
            }
        }
        return func.apply(undefined, args);
    };
}

function binarySearch(key, array) {
    run({key: 'g', array: ['a', 'b', 'c', 'e', 'f']});

    var low = 0; p({low: 0});
    var high = array.length - 1; p({high: 5});

    while (low <= high) {
        p(low, [0, 3, 5]);
        p(high, [5, 5, 5]),
        p(mid, [2, 4, 5]);
        p(value, ['c', 'e', 'f']);
        
        var mid = Math.floor((low + high)/2);
        var value = array[mid];

        if (value < key) {
            low = mid + 1; p({low: [3, 4, 6]});
        }
        else if (value > key) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }

    return -1;
}

var probes = {};

function patchProbes(tree, lit) {
    var patch = [];
    var found = true;
    traverse(tree, function(x) {
        if (x.type === 'FunctionDeclaration' ) {
            if (x.body.body[0].type === 'ExpressionStatement'
                && x.body.body[0].expression.type === 'CallExpression'
                && x.body.body[0].expression.callee.name === 'run'
                && x.body.body[0].expression.range[0] === lit.range[0]) {
                found = true;
            }
        }
        if (x.type === 'CallExpression' && x.callee.name === 'p') {
            var loc = x.loc;
            console.log(JSON.stringify(probes));
            var key = loc.start.line + ':' + (loc.start.column + 1);
            console.log("KEY = " + key);
            var probed = probes[key];
            if (x.arguments.length > 1) {
                // replace last arg
                patch.push({range: x.arguments[1].range,
                           loc: x.arguments[1].loc,
                            value: JSON.stringify(probed)});
            }
            else {
                // insert last arg.
                patch.push({range: [x.arguments[0].range[1], x.arguments[0].range[1]],
                            value: ', ' + JSON.stringify(probed)});
            }
        }
    });
    return patch;
}


// transforms to: p({x: valueOfX})
function p(x, ignored) {
    var err = getErrorObject();
    var caller_line = err.stack.split('\n')[4];
    console.log("caller = " + caller_line);
    var index = caller_line.indexOf('<anonymous>');
    var key = caller_line.slice(index+12, caller_line.length - 1);
    console.log("key = " + key);

    if (!probes.hasOwnProperty(key)) {
        probes[key] = [];
    }
    probes[key].push(x);
    return probes[key];
}




function getErrorObject(){
    try { throw Error('') } catch(err) { return err; }
}




var silent = false;
function changeHandler(editor) {
    return function(e) {
        if (!silent) {
            updateLiterals(editor);
        }
    };
}


function updateLiterals(editor) {
    var src = editor.getValue();
    try {
        var tree = esprima.parse(src, {range: true, loc: true});
    }
    catch (e) {
        return;
    }

    var sheet = findSheet(tree);

    if (!sheet) {
        return;
    }
    
    var geval = eval;
    try {
        cellFuncs = [];
        var value = geval(src + '; ' + src.slice(sheet.range[0], sheet.range[1]));
    }
    catch (e) {
        console.log(e);
        return;
    }
    var patch = patchSheet(tree, value);

    var tests = findTests(tree);
    for (var j = 0; j < tests.length; j++) {
        var testSrc = src.slice(tests[j].test.range[0], tests[j].test.range[1]);
        var val = geval(src + '; ' + testSrc);
        var func = geval(src + '; ' + tests[j].name);
        var specs = val(func);
        var testPatch = patchTest(tree, tests[j].test, specs);
        patch = patch.concat(testPatch);
    }

    var runs = findRuns(tree);

    for (var j = 0; j < runs.length; j++) {
        probes = {}; // reset for each run
        console.log(JSON.stringify(runs[j]));
        var runSrc = src.slice(runs[j].run.range[0], runs[j].run.range[1]);
        var val = geval(src + '; ' + runSrc);
        var func = geval(src + '; ' + runs[j].name);
        val(func); // run function
        var probePatches = patchProbes(tree, runs[j].run);
        patch = patch.concat(probePatches);
    }

    
    var session = editor.getSession();
    var doc = session.getDocument();
    var offset = 0;
    for (var i = 0; i < patch.length; i++) {
        var p = patch[i];
        src = src.slice(0, offset + p.range[0]) + p.value + src.slice(offset + p.range[1]);
        offset += (p.value + '').length - (p.range[1] - p.range[0]);
        console.log('offset = ' + offset);
    }

    silent = true;
    var pos = editor.getCursorPosition();
    editor.getSession().setValue(src);
    // todo: adjust with offset.
    editor.moveCursorToPosition(pos);
    silent = false;


}
