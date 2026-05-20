const router = require("express").Router();

const accountRoutes = require("./account.route");
const dashboardRoutes = require("./dashboard.route");
const monHocRoutes = require("./mon-hoc.route");
const lopRoutes = require("./lop.route");
const sinhVienRoutes = require("./sinh-vien.route");
const giaoVienRoutes = require("./giao-vien.route");
const boDeRoutes = require("./bo-de.route");
const dangKyThiRoutes = require("./dang-ky-thi.route");
const bangDiemRoutes = require("./bang-diem.route");
const { pathAdmin } = require("../../configs/variable.config");

router.get('/', (req, res) => {
    res.redirect(`/${pathAdmin}/dashboard`);
});

router.use('/account', accountRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/mon-hoc', monHocRoutes);
router.use('/lop', lopRoutes);
router.use('/sinh-vien', sinhVienRoutes);
router.use('/giao-vien', giaoVienRoutes);
router.use('/bo-de', boDeRoutes);
router.use('/dang-ky-thi', dangKyThiRoutes);
router.use('/bang-diem', bangDiemRoutes);

router.use((req,res) => {
    res.render('admin/pages/error-404', {
        pageTitle: "404 Not Found"
    });
});


module.exports = router;
