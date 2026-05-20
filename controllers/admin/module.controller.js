const { getModule } = require("../../configs/modules.config");

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

module.exports.detail = (key) => (req, res) => {
  const moduleConfig = getModule(key);

  res.render("admin/pages/module-detail", {
    pageTitle: `Chi tiet ${moduleConfig.title.toLowerCase()}`,
    module: moduleConfig,
  });
};
