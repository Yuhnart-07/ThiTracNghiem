module.exports.dashboard =  (req, res) => {
  res.render('admin/pages/dashboard', {
    pageTitle: "Tong quan",
    modules: [
      { label: "Mon hoc", key: "mon-hoc", table: "MONHOC" },
      { label: "Lop", key: "lop", table: "LOP" },
      { label: "Sinh vien", key: "sinh-vien", table: "SINHVIEN" },
      { label: "Giao vien", key: "giao-vien", table: "GIAOVIEN" },
      { label: "Bo de", key: "bo-de", table: "BODE" },
      { label: "Dang ky thi", key: "dang-ky-thi", table: "GIAOVIEN_DANGKY" },
      { label: "Bang diem", key: "bang-diem", table: "BANGDIEM" },
    ],
  }) 
};
