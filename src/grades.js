
cell(function avg(sheet, lab, exam) {
  return (lab + exam) / 2;
});

cell(function classAvg(sheet) {
  return avg('avg', sheet);
});


var grades = sheet([
 {student: 'Felienne', lab: 32343, exam: 9, avg: 16176},
 {student: 'Tijs', lab: 10, exam:7.7, avg: 8.85},
 {student: 'Piet', lab: 4, exam:7.7, avg: 5.85},
 {classAvg: 5396.900000000001}
]);

