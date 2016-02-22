
//row(function classAvg(sheet) {
//  return avg('avg', sheet);
//});

row(function avg(sheet, lab, exam) {
  return (lab + exam) / 2;
});

row(function sum(sheet, lab, exam) {
  return (lab + exam);
});

row(function classAvg(sheet, classAvg) {
  return avg('avg', sheet);
});


var grades = sheet([
 {student: 'Felienne', lab: 6, exam: 9, avg: 7.5, sum: 15},
 {student: 'Tijs', lab: 8, exam: 7.55, avg: 7.775, sum: 15.55},
 {student: 'Piet', lab: 7, exam: 6.6, avg:6.8, sum: 13.6},
 {student: 'Truus', lab: 77, exam: 6.6, avg:41.8, sum: 83.6},
 {classAvg: 15.96875}
]);

