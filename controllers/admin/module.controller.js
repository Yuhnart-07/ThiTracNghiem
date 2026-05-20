const modules = {
  "mon-hoc": require("../../models/mon-hoc.model"),
  lop: require("../../models/lop.model"),
  "sinh-vien": require("../../models/sinh-vien.model"),
  "giao-vien": require("../../models/giao-vien.model"),
  "bo-de": require("../../models/bo-de.model"),
  "dang-ky-thi": require("../../models/giao-vien-dang-ky.model"),
  "bang-diem": require("../../models/bang-diem.model"),
};

const getModule = (key) => {
  const moduleConfig = modules[key];

  if (!moduleConfig) {
    throw new Error(`Chua cau hinh module ${key}`);
  }

  return moduleConfig;
};

module.exports.list = (key) => (req, res) => {
  const moduleConfig = getModule(key);

  res.render("admin/pages/module-list", {
    pageTitle: moduleConfig.pageTitle,
    module: moduleConfig,
    rows: [],
  });
};

module.exports.create = (key) => (req, res) => {
  const moduleConfig = getModule(key);

  res.render("admin/pages/module-form", {
    pageTitle: `Them ${moduleConfig.title.toLowerCase()}`,
    module: moduleConfig,
  });
};
