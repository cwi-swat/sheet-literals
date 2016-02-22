
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
 {numOfStudents: 4},
 {student: 'Felienne', lab: 11 , exam:99, avg:55},
 {student:'Tijs', lab:100, exam: 7.55, avg: 53.775},
 {student:'Piet', lab:77, exam:66, avg:71.5},
 {student:'Truus', lab:77, exam:66, avg:71.5},
 {classAvg:62.94375}
]);

