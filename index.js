const express = require('express') // TƯƠNG TỰ LỆNH IMPORT
const path = require('path')
const app = express()
const port = 3000

// THIẾT LẬP THƯ MỤC CHỨA FILE VIEW
app.set('views', path.join(__dirname, 'views')); // PATH ĐỂ NỐI TÊN PROJECT VỚI /VIEW

// THIẾT LẬP PUB LÀM VIEW ENGINE
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('client/pages/home') // RENDER DÙNG ĐỂ CHUYỂN TỪ CÚ PHÁP PUG SANG HTML
})

app.get('/tour', (req, res) => {
  res.render('client/pages/tour-list')
})
app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})
