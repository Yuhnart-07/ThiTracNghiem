const service=require("../../services/lecturer/exam-registration.service");

module.exports.page=async(req,res)=>{try{const data=await service.getPageData(req.user);return res.render("admin/pages/exam-registration",{pageTitle:"Theo dõi đăng ký thi",currentUser:data.user,classes:data.classes,subjects:data.subjects});}catch(e){return res.status(500).send(e.message);}};

module.exports.list=async(req,res)=>{try{return res.json({success:true,data:await service.getRegistrations(req.user,req.query)});}catch(e){return res.status(500).json({success:false,message:e.message});}};

module.exports.checkQuestions = async (req, res) => {
  try {
    return res.json({ success: true, data: await service.checkQuestions(req.user, req.body) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const data = await service.create(req.user, req.body);
    return res.status(201).json({ success: true, message: data?.ThongBao || "Đăng ký thi thành công." });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const data = await service.update(req.user, req.params, req.body);
    return res.json({ success: true, message: data?.ThongBao || "Cập nhật đăng ký thi thành công." });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const data = await service.remove(req.user, req.params);
    return res.json({ success: true, message: data?.ThongBao || "Xóa đăng ký thi thành công." });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.removeMultiple = async (req, res) => {
  try {
    const { items } = req.body;
    const data = await service.removeMultiple(req.user, items);
    return res.json({ success: true, message: data?.ThongBao || "Xóa các đăng ký thi đã chọn thành công." });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
