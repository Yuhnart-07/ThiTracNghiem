module.exports.questionBank =  (req, res) => {
  res.render('lecturer/pages/question-bank', {
    pageTitle: "Quản lý câu hỏi thi"
  }) 
};


module.exports.testExam =  (req, res) => {
  res.render('lecturer/pages/test-exam', {
    pageTitle: "Thi thử"
  }) 
};