const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE); // KẾT NỐI CSDL
        console.log("Kết nối CSDL thành công! ");
    } catch (error) {
        console.log("Kết nối CSDL thất bại!", error);
    }
}

module.exports = connectDB;