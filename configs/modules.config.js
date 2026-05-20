const moduleList = [
  require("../models/mon-hoc.model"),
  require("../models/lop.model"),
  require("../models/sinh-vien.model"),
  require("../models/giao-vien.model"),
  require("../models/bo-de.model"),
  require("../models/giao-vien-dang-ky.model"),
  require("../models/bang-diem.model"),
];

const moduleMap = moduleList.reduce((result, moduleConfig) => {
  result[moduleConfig.key] = moduleConfig;
  return result;
}, {});

const getModule = (key) => {
  const moduleConfig = moduleMap[key];

  if (!moduleConfig) {
    throw new Error(`Chua cau hinh module ${key}`);
  }

  return moduleConfig;
};

module.exports = {
  moduleList,
  moduleMap,
  getModule,
};
