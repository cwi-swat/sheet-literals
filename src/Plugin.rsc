module Plugin

import ParseTree;
import Sheets;
import util::IDE;
import util::Maybe;
import IO;


private str LANG = "SheetJS";

void main() {
  registerLanguage(LANG, "js", start[Source](str src, loc org) {
    return parse(#start[Source], src, org);
  });
  
  /*
  Maybe[tuple[Id, Expression]] findSheet(start[Source] src) { 
  Expression evalSheet(start[Source] src, Id x) {
  lrel[loc, str] updateSheet(start[Source] src, Expression old, Expression new) 
  */
  Maybe[Expression] last = nothing();
  
  registerContributions(LANG, {
    liveUpdater(lrel[loc,str] (start[Source] src) {
       if (just(<x, e>) := findSheet(src)) {
         if (just(Expression oldE) := last) {
           if (oldE == e) {
             return [];
           }
         }
         e2 = evalSheet(src, x);
         last = just(e);
         return updateSheet(e, e2);
       }
       return [];
    })
  });
  
  
}