const express = require('express') // TƯƠNG TỰ LỆNH IMPORT
require('dotenv').config();
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
const { connectDB } = require("./configs/database.config")

const adminRoutes = require("./routes/admin/index.route");
const clientRoutes = require("./routes/client/index.route");

// PATH DÙNG CHUNG CHO FE
const { pathAdmin } = require("./configs/variable.config");

// KẾT NỐI CSDL
connectDB().catch(() => {
  console.log("Ung dung van khoi dong de nhom co the tiep tuc dung khung UI.");
});

// THIẾT LẬP THƯ MỤC CHỨA FILE VIEW
app.set('views', path.join(__dirname, 'views')); // PATH ĐỂ NỐI TÊN PROJECT VỚI /VIEW

// THIẾT LẬP PUB LÀM VIEW ENGINE
app.set('view engine', 'pug');

// THIẾT LẬP THƯ MỤC PUBLIC LÀ THƯ MỤC CHỨA FILE TĨNH
app.use(express.static(path.join(__dirname, 'public')));

// TẠO BIẾN TOÀN CỤC TRONG FILE PUG (CHỈ DÙNG ĐƯỢC TRONG FILE PUG, KHÔNG DÙNG ĐƯỢC TRONG CÁC FILE JS)
app.locals.pathAdmin = pathAdmin;

// CHO PHÉP BE GỬI DỮ LIỆU BẰNG JSON && ĐỒNG THỜI CHUYỂN DỮ LIỆU TỪ JSON -> JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// THIẾT LẬP ĐƯỜNG DẪN
app.use(`/${pathAdmin}`, adminRoutes);
app.use('/', clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})

// phucnguyen1182005_db_user
// NRPMxNzTlpJU4WaY
