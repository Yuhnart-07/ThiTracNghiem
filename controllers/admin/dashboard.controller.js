const { moduleList } = require("../../configs/modules.config");

module.exports.dashboard =  (req, res) => {
  res.render('admin/pages/dashboard', {
    pageTitle: "Tong quan",
    modules: moduleList,
  }) 
};
