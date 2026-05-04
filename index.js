const express = require('express') // TƯƠNG TỰ LỆNH IMPORT
require('dotenv').config();
const path = require('path')
const app = express()
const port = 3000
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE); // KẾT NỐI CSDL

const Tour = mongoose.model(
  'Tour', 
  { 
    name: String,
    time: String, 
    vehicle: String
  },
  "tours" // TÊN COLLECTION
);


// THIẾT LẬP THƯ MỤC CHỨA FILE VIEW
app.set('views', path.join(__dirname, 'views')); // PATH ĐỂ NỐI TÊN PROJECT VỚI /VIEW

// THIẾT LẬP PUB LÀM VIEW ENGINE
app.set('view engine', 'pug');

// THIẾT LẬP THƯ MỤC PUBLIC LÀ THƯ MỤC CHỨA FILE TĨNH
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('client/pages/home', {
    pageTitle: "Trang chủ"
  }) // RENDER DÙNG ĐỂ CHUYỂN TỪ CÚ PHÁP PUG SANG HTML
});

app.get('/tour', async (req, res) => {
  const tourList = await Tour.find({}); // AWAIT LÀ CHỜ LẤY DỮ LIỆU DÒNG NÀY XONG MỚI CHẠY XUỐNG DÒNG DƯỚI


  res.render('client/pages/tour-list', {
    pageTitle: "Danh sách tour",
    tourList: tourList
  })
})
app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})

// phucnguyen1182005_db_user
// NRPMxNzTlpJU4WaY