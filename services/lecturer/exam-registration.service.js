const repo = require("../../repositories/lecturer/exam-registration.repository");
class ExamRegistrationError extends Error { constructor(message,statusCode=400){super(message);this.statusCode=statusCode;} }
const text=(v)=>String(v??"").trim();
const userOf=(u)=>({role:text(u?.role||u?.ROLE).toUpperCase(),maGiangVien:text(u?.maGiangVien||u?.MAGV||u?.magv)});
const assertView=(u)=>{const x=userOf(u);if(!u)throw new ExamRegistrationError("Vui lòng đăng nhập.",401);if(!["GIANGVIEN","PGV"].includes(x.role))throw new ExamRegistrationError("Bạn không có quyền truy cập module đăng ký thi.",403);if(!x.maGiangVien)throw new ExamRegistrationError("Tài khoản chưa gắn mã giảng viên.",403);return x;};
const assertWrite=(u)=>{const x=assertView(u);return x;};
const rejectIdentity=(b)=>{if(["MAGV","magv","maGiangVien","lecturerCode"].some((k)=>Object.prototype.hasOwnProperty.call(b||{},k)))throw new ExamRegistrationError("Không được gửi MAGV từ form.",400);};
const payloadOf=(b,magv)=>({maGiangVien:magv,maLop:text(b.maLop||b.MALOP),maMonHoc:text(b.maMonHoc||b.MAMH),trinhDo:text(b.trinhDo||b.TRINHDO).toUpperCase(),lan:Number(b.lan||b.LAN),soCauThi:Number(b.soCauThi||b.SOCAUTHI),ngayThi:text(b.ngayThi||b.NGAYTHI),thoiGian:Number(b.thoiGian||b.THOIGIAN)});
const validate=(p)=>{if(!p.maLop||!p.maMonHoc||!p.trinhDo||!p.ngayThi)throw new ExamRegistrationError("Vui lòng nhập đầy đủ thông tin đăng ký.");if(!["A","B","C"].includes(p.trinhDo))throw new ExamRegistrationError("Trình độ chỉ được là A, B hoặc C.");if(!Number.isInteger(p.lan)||p.lan<1||p.lan>2)throw new ExamRegistrationError("Lần thi phải là 1 hoặc 2.");if(!Number.isInteger(p.soCauThi)||p.soCauThi<10||p.soCauThi>100)throw new ExamRegistrationError("Số câu thi phải từ 10 đến 100.");if(!Number.isInteger(p.thoiGian)||p.thoiGian<5||p.thoiGian>60)throw new ExamRegistrationError("Thời gian thi phải từ 5 đến 60 phút.");if(Number.isNaN(new Date(p.ngayThi).getTime()))throw new ExamRegistrationError("Ngày giờ thi không hợp lệ.");if(new Date(p.ngayThi)<=new Date())throw new ExamRegistrationError("Ngày giờ thi phải nằm trong tương lai.");};
const keyOf=(v)=>{const k={maMonHoc:text(v.maMonHoc),maLop:text(v.maLop),lan:Number(v.lan)};if(!k.maMonHoc||!k.maLop||![1,2].includes(k.lan))throw new ExamRegistrationError("Khóa đăng ký thi không hợp lệ.");return k;};
const sqlError=(e)=>{if(e instanceof ExamRegistrationError)throw e;const m=e.originalError?.info?.message||e.message||"Lỗi xử lý đăng ký thi.";const status=/không tồn tại/i.test(m)?404:/trùng|chồng|không đủ|phát sinh|không được/i.test(m)?409:500;throw new ExamRegistrationError(m,status);};
const getPageData=async(u)=>{const user=assertView(u);return{user,...await repo.getReferenceData()};};
const getRegistrations=async(u,q={})=>{const x=assertView(u);const trinhDo=text(q.trinhDo).toUpperCase();if(trinhDo&&!["A","B","C"].includes(trinhDo))throw new ExamRegistrationError("Trình độ lọc không hợp lệ.");return repo.getRegistrations({maGiangVien:x.role==="GIANGVIEN"?x.maGiangVien:null,maLop:text(q.maLop)||null,maMonHoc:text(q.maMonHoc)||null,trinhDo:trinhDo||null,keyword:text(q.keyword||q.q)||null});};
const checkQuestions=async(u,b)=>{assertWrite(u);const p=payloadOf(b,"");if(!p.maMonHoc||!["A","B","C"].includes(p.trinhDo)||!Number.isInteger(p.soCauThi)||p.soCauThi<10||p.soCauThi>100)throw new ExamRegistrationError("Chọn môn, trình độ và số câu hợp lệ trước khi kiểm tra.");return repo.checkQuestions(p);};
const create=async(u,b)=>{try{const x=assertWrite(u);rejectIdentity(b);const p=payloadOf(b,x.maGiangVien);validate(p);return await repo.createRegistration(p);}catch(e){return sqlError(e);}};
const update=async(u,k,b)=>{try{const x=assertWrite(u);rejectIdentity(b);const p=payloadOf(b,x.maGiangVien);validate(p);return await repo.updateRegistration(keyOf(k),p);}catch(e){return sqlError(e);}};
const remove=async(u,k)=>{try{const x=assertWrite(u);return await repo.deleteRegistration(keyOf(k),x.maGiangVien);}catch(e){return sqlError(e);}};
const removeMultiple=async(u,items)=>{
  try{
    const x=assertWrite(u);
    if(!Array.isArray(items) || items.length === 0){
      throw new ExamRegistrationError("Danh sách đăng ký cần xóa không hợp lệ.",400);
    }
    for(const item of items){
      await repo.deleteRegistration(keyOf(item), x.maGiangVien);
    }
    return { ThongBao: "Xóa các đăng ký thi thành công." };
  }catch(e){
    return sqlError(e);
  }
};
module.exports={ExamRegistrationError,getPageData,getRegistrations,checkQuestions,create,update,remove,removeMultiple};
