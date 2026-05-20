module.exports.start = (req, res) => {
  res.render("client/pages/exam", {
    pageTitle: "Thi trac nghiem",
  });
};

module.exports.result = (req, res) => {
  res.render("client/pages/result", {
    pageTitle: "Xem ket qua",
  });
};
