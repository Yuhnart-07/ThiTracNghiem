module.exports.cart =  (req, res) => {
  res.render('client/pages/cart', {
    pageTitle: "Giỏ hàng"
  }) // RENDER DÙNG ĐỂ CHUYỂN TỪ CÚ PHÁP PUG SANG HTML
};
