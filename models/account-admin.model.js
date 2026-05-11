const mongoose = require('mongoose');

const schema = new mongoose.Schema( 
  { 
    fullName: String,
    email: String, 
    password: String,
    status: String
  },
  {
    timestamps: true // TỰ ĐỘNG SINH RA TRƯỜNG CREATEAT VÀ UPDATEAT
  }
)

const AccountAdmin = mongoose.model('AccountAdmin', schema, "accounts-admin");
module.exports = AccountAdmin;