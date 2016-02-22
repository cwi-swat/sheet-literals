module Sheets

// NB: bug if module has same name as nonterminal.
extend lang::javascript::saner::Syntax;
import ParseTree;
import String;
import IO;
import lang::json::ast::JSON;
import lang::javascript::EvalJS;
import util::Maybe;

Maybe[tuple[Id, Expression]] findSheet(start[Source] src) { 
   if (/(Statement)`var <Id x> = sheet(<Expression e>);` := src) {
      return just(<x, e>);
   }
   return nothing();
}

Expression evalSheet(loc lib, start[Source] src, Id x) {
  str json = evalJS(lib, "<src>; JSON.stringify(<x>)");
  json = replaceAll(json, "\"", "\'");
  return parse(#Expression, json);
}

lrel[loc, str] updateSheet(Expression old, Expression new) {
   oldRows = [e | e <- old.elements];
   newRows = [e | e <- new.elements];
   numOfRows = size(newRows);
   assert size(oldRows) == numOfRows;
   
   return ( [] | it + updateRow(oldRows[i], newRows[i]) | i <- [0..numOfRows] );
}

lrel[loc,str] updateRow(Expression row, Expression newRow) 
  = ( [] | it + updateOrAppend(row, p) | PropertyAssignment p <- newRow.properties ); 

lrel[loc,str] updateOrAppend(Expression row, PropertyAssignment p) {
     lrel[loc, str] patch = [];
     found = false;
     // match on literal, so that only raw data is patched.
     for ((PropertyAssignment)`<PropertyName x>: <Literal l>` <- row.properties) {
       if (unquote(x) == unquote(p.name)) {
         found = true;
         patch += [<l@\loc, "<p.\value>">];
       }
     }
     if (!found) {
       if ((Expression)`{<{PropertyAssignment ","}* ps>}` := row) {
         loc ins = row@\loc;
         if (_ <- ps) { // non-empty
           ins.offset = ins.offset + ins.length - 1;
           ins.length = 0;
           patch += [<ins, ", <unquote(p.name)>: <p.\value>">];
         }
         else {
           ins.offset = ins.offset + 1;
           ins.length = 0;
           patch += [<ins, "<unquote(p.name)>: <p.\value>">];
         }
       }
     }
     return patch;
}

str unquote((PropertyName)`<Id x>`) = "<x>";
str unquote((PropertyName)`<String x>`) = "<x>"[1..-1];

