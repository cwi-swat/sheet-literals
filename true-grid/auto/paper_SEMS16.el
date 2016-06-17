(TeX-add-style-hook
 "paper_SEMS16"
 (lambda ()
   (add-to-list 'LaTeX-verbatim-environments-local "lstlisting")
   (add-to-list 'LaTeX-verbatim-macros-with-braces-local "url")
   (add-to-list 'LaTeX-verbatim-macros-with-braces-local "path")
   (add-to-list 'LaTeX-verbatim-macros-with-braces-local "lstinline")
   (add-to-list 'LaTeX-verbatim-macros-with-delims-local "url")
   (add-to-list 'LaTeX-verbatim-macros-with-delims-local "path")
   (add-to-list 'LaTeX-verbatim-macros-with-delims-local "lstinline")
   (TeX-run-style-hooks
    "latex2e"
    "llncs"
    "llncs10"
    "graphicx"
    "listings"
    "color"
    "array"
    "url")
   (TeX-add-symbols
    '("todo" 1))
   (LaTeX-add-labels
    "fig:bret"
    "fig:TG"
    "FIG:grades"
    "SECT:dev"
    "FIG:leftpad")
   (LaTeX-add-bibliographies
    "references")
   (LaTeX-add-color-definecolors
    "lightgray"
    "darkgray"
    "purple"))
 :latex)

