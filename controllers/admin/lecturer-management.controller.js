module.exports.list =  (req, res) => {
  res.render('admin/pages/lecturer-management', {
    pageTitle: "Quản lý giáo viên"
  }) 
};