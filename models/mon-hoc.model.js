module.exports = {
  key: "mon-hoc",
  icon: "fa-solid fa-book",
  routeBase: "/mon-hoc",
  tableName: "MONHOC",
  title: "Mon hoc",
  pageTitle: "Quan ly mon hoc",
  primaryKey: "MAMH",
  fields: [
    { name: "MAMH", label: "Ma mon hoc", type: "nchar(5)", required: true },
    { name: "TENMH", label: "Ten mon hoc", type: "nvarchar(50)", required: false },
  ],
  actions: ["list", "create"],
  ownerHint: "CRUD mon hoc, du lieu nen bam sat bang MONHOC.",
  note: "Bang mon hoc dung de dang ky va thi trac nghiem.",
};
