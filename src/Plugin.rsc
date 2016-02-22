module Plugin

import ParseTree;
import Sheets;
import util::IDE;
import util::Maybe;
import IO;


private str LANG = "JS+SheetLiterals";

void main() {
  registerLanguage(LANG, "js", start[Source](str src, loc org) {
    return parse(#start[Source], src, org);
  });

  Maybe[Expression] last = nothing();
  
  registerContributions(LANG, {
    liveUpdater(lrel[loc,str] (start[Source] src) {
       if (just(<x, e>) := findSheet(src)) {
         if (just(Expression oldE) := last) {
           if (oldE == e) {
             return [];
           }
         }
         e2 = evalSheet(|project://sheet-literals/src/libsheet2.js|, src, x);
         last = just(e);
         return updateSheet(e, e2);
       }
       return [];
    })
  });
  
  
}