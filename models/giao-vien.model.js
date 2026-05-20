module.exports = {
  key: "giao-vien",
  icon: "fa-solid fa-chalkboard-user",
  routeBase: "/giao-vien",
  tableName: "GIAOVIEN",
  title: "Giao vien",
  pageTitle: "Quan ly giao vien",
  primaryKey: "MAGV",
  fields: [
    { name: "MAGV", label: "Ma giao vien", type: "nchar(8)", required: true },
    { name: "HO", label: "Ho", type: "nvarchar(50)", required: false },
    { name: "TEN", label: "Ten", type: "nvarchar(10)", required: false },
    { name: "DIACHI", label: "Dia chi", type: "nvarchar(50)", required: false },
    { name: "SODTLL", label: "So dien thoai lien lac", type: "nchar(15)", required: false },
  ],
  actions: ["list", "create"],
  ownerHint: "CRUD giao vien, chua gan auth/phan quyen that.",
  note: "Thong tin giao vien tao cau hoi va dang ky lich thi.",
};
