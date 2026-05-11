module.exports.home =  (req, res) => {
  res.render('client/pages/home', {
    pageTitle: "Trang chủ"
  }) // RENDER DÙNG ĐỂ CHUYỂN TỪ CÚ PHÁP PUG SANG HTML
};

