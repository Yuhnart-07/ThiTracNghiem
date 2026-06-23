module.exports.exam = (req, res) => {
  res.render("client/pages/exam", {
    pageTitle: "Thi trắc nghiệm",
  });
};

module.exports.examReview = (req, res) => {
  res.render("client/pages/exam-review", {
    pageTitle: "Xem lại bài thi",
  });
};
