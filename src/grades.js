
row(function ClassAvg(sheet) {
    this.classAvg = function () {
        return avg('avg', sheet);
    };
});

row(function Grade(sheet, student, lab, exam) {
    this.student = student;
    this.lab = lab;
    this.exam = exam;
    this.avg = function () {
        return (this.lab + this.exam) / 2;
    };
});


var grades = sheet([
 {student: 'Felienne', lab: 8, exam:9, avg:8.5},
 {student:'Tijs', lab: 8, exam: 7.55, avg: 7.775},
 {student:'Piet', lab: 7, exam: 6.6, avg:6.8},
 {student:'Truus', lab: 7.7, exam: 6.6, avg:7.15},
 {classAvg:7.55625}
]);

