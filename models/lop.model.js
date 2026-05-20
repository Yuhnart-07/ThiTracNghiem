module.exports = {
  key: "lop",
  icon: "fa-solid fa-users-rectangle",
  routeBase: "/lop",
  tableName: "LOP",
  title: "Lop",
  pageTitle: "Quan ly lop",
  primaryKey: "MALOP",
  fields: [
    { name: "MALOP", label: "Ma lop", type: "nchar(15)", required: true },
    { name: "TENLOP", label: "Ten lop", type: "nvarchar(50)", required: true },
  ],
  actions: ["list", "create"],
  ownerHint: "CRUD lop, sau nay lien ket man hinh sinh vien theo MALOP.",
  note: "Bang lop theo THITRACNGHIEM.sql.",
  gaps: ["De bai ghi MALOP nchar(8), SQL hien tai dung nchar(15). Tam thoi bam theo SQL."],
};
