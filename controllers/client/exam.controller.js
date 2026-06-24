const { getPool, sql } = require("../../configs/database.config");

module.exports.exam = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    if (!studentId) {
      return res.redirect("/");
    }

    const pool = getPool();

    // 1. Lấy mã lớp của sinh viên nếu chưa có trong session cookie
    let maLop = req.user.maLop;
    if (!maLop) {
      const studentRes = await pool
        .request()
        .input("MASV", sql.NChar(8), studentId)
        .query("SELECT MALOP FROM SINHVIEN WHERE RTRIM(MASV) = RTRIM(@MASV)");
      if (studentRes.recordset[0]) {
        maLop = studentRes.recordset[0].MALOP?.trim();
      }
    }

    if (!maLop) {
      return res.status(400).send("Không tìm thấy thông tin lớp học của sinh viên.");
    }

    // 2. Lấy danh sách các phòng thi được đăng ký cho lớp này
    const result = await pool
      .request()
      .input("MALOP", sql.NVarChar(50), maLop)
      .input("MASV", sql.NChar(8), studentId)
      .query(`
        SELECT gd.MAMH, m.TENMH, gd.SOCAUTHI, gd.THOIGIAN, gd.LAN, gd.TRINHDO, gd.NGAYTHI,
               bt.TRANGTHAI AS BAITHI_TRANGTHAI, bt.ID AS BAITHI_ID
        FROM GIAOVIEN_DANGKY gd
        JOIN MONHOC m ON gd.MAMH = m.MAMH
        LEFT JOIN BAITHI bt ON bt.MASV = @MASV AND bt.MAMH = gd.MAMH AND bt.LAN = gd.LAN
        WHERE RTRIM(gd.MALOP) = RTRIM(@MALOP)
        ORDER BY gd.NGAYTHI DESC
      `);

    const now = new Date();
    const rooms = result.recordset.map((row) => {
      const ngayThi = new Date(row.NGAYTHI);
      const ketThuc = new Date(ngayThi.getTime() + row.THOIGIAN * 60000);
      
      let status = "UPCOMING"; // Chưa đến giờ thi
      if (row.BAITHI_TRANGTHAI === "DA_NOP") {
        status = "COMPLETED"; // Đã nộp bài
      } else if (row.BAITHI_TRANGTHAI === "DANG_THI") {
        status = "IN_PROGRESS"; // Đang làm dở (tiếp tục thi)
      } else {
        if (now >= ngayThi && now <= ketThuc) {
          status = "AVAILABLE"; // Đang diễn ra (có thể vào thi)
        } else if (now > ketThuc) {
          status = "EXPIRED"; // Đã hết hạn ca thi mà chưa thi
        }
      }

      return {
        maMonHoc: row.MAMH?.trim(),
        tenMonHoc: row.TENMH?.trim(),
        soCauThi: row.SOCAUTHI,
        thoiGian: row.THOIGIAN,
        lan: row.LAN,
        trinhDo: row.TRINHDO?.trim(),
        ngayThi: row.NGAYTHI,
        baithiId: row.BAITHI_ID,
        status,
      };
    });

    res.render("client/pages/exam", {
      pageTitle: "Thi trắc nghiệm",
      rooms,
    });
  } catch (e) {
    res.status(500).send("Có lỗi xảy ra: " + e.message);
  }
};

module.exports.startExam = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    const { maMonHoc, lan } = req.body;
    if (!studentId || !maMonHoc || !lan) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin phòng thi." });
    }

    const pool = getPool();

    // 1. Lấy lớp của sinh viên
    let maLop = req.user.maLop;
    if (!maLop) {
      const studentRes = await pool
        .request()
        .input("MASV", sql.NChar(8), studentId)
        .query("SELECT MALOP FROM SINHVIEN WHERE RTRIM(MASV) = RTRIM(@MASV)");
      if (studentRes.recordset[0]) {
        maLop = studentRes.recordset[0].MALOP?.trim();
      }
    }

    // 2. Kiểm tra lịch đăng ký thi khả dụng
    const registerRes = await pool
      .request()
      .input("MALOP", sql.NVarChar(50), maLop)
      .input("MAMH", sql.NVarChar(50), maMonHoc)
      .input("LAN", sql.SmallInt, Number(lan))
      .query(`
        SELECT * FROM GIAOVIEN_DANGKY 
        WHERE RTRIM(MALOP) = RTRIM(@MALOP) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
      `);

    const registration = registerRes.recordset[0];
    if (!registration) {
      return res.status(404).json({ success: false, message: "Lịch thi không tồn tại hoặc lớp của bạn không được đăng ký thi môn này." });
    }

    // Kiểm tra giờ thi
    const now = new Date();
    const ngayThi = new Date(registration.NGAYTHI);
    const ketThuc = new Date(ngayThi.getTime() + registration.THOIGIAN * 60000);
    if (now < ngayThi || now > ketThuc) {
      return res.status(400).json({ success: false, message: "Phòng thi hiện không mở cửa hoặc đã hết giờ làm bài." });
    }

    // 3. Kiểm tra xem đã có bài thi chưa
    const examRes = await pool
      .request()
      .input("MASV", sql.NChar(8), studentId)
      .input("MAMH", sql.NVarChar(50), maMonHoc)
      .input("LAN", sql.SmallInt, Number(lan))
      .query(`
        SELECT * FROM BAITHI 
        WHERE RTRIM(MASV) = RTRIM(@MASV) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
      `);

    const existingExam = examRes.recordset[0];
    if (existingExam) {
      if (existingExam.TRANGTHAI === "DA_NOP") {
        return res.status(400).json({ success: false, message: "Bạn đã hoàn thành ca thi này và không thể thi lại." });
      }
      return res.json({ success: true, redirectUrl: `/client/exam/take/${existingExam.ID}` });
    }

    // 4. Sinh câu hỏi ngẫu nhiên theo quy tắc 70% - 30%
    const trinhDo = registration.TRINHDO?.trim();
    const soCauThi = registration.SOCAUTHI;
    let questions = [];

    if (trinhDo === "C") {
      // 100% câu hỏi trình độ C
      const qRes = await pool
        .request()
        .input("MAMH", sql.NVarChar(50), maMonHoc)
        .input("SOCAUTHI", sql.SmallInt, soCauThi)
        .query(`
          SELECT TOP (@SOCAUTHI) CAUHOI FROM BODE 
          WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = 'C' 
          ORDER BY NEWID()
        `);
      questions = qRes.recordset;
    } else {
      const soCauDung = Math.ceil(soCauThi * 0.7);
      const soCauThap = soCauThi - soCauDung;
      const trinhDoThap = trinhDo === "A" ? "B" : "C";

      const [qDungRes, qThapRes] = await Promise.all([
        pool
          .request()
          .input("MAMH", sql.NVarChar(50), maMonHoc)
          .input("TRINHDO", sql.Char(1), trinhDo)
          .input("LIMIT", sql.SmallInt, soCauDung)
          .query(`
            SELECT TOP (@LIMIT) CAUHOI FROM BODE 
            WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = @TRINHDO 
            ORDER BY NEWID()
          `),
        pool
          .request()
          .input("MAMH", sql.NVarChar(50), maMonHoc)
          .input("TRINHDO", sql.Char(1), trinhDoThap)
          .input("LIMIT", sql.SmallInt, soCauThap)
          .query(`
            SELECT TOP (@LIMIT) CAUHOI FROM BODE 
            WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = @TRINHDO 
            ORDER BY NEWID()
          `),
      ]);

      questions = [...qDungRes.recordset, ...qThapRes.recordset];
    }

    if (questions.length < soCauThi) {
      return res.status(400).json({ success: false, message: "Ngân hàng đề thi không đủ câu hỏi cho trình độ đã đăng ký!" });
    }

    // Trộn ngẫu nhiên câu hỏi một lần nữa
    questions.sort(() => Math.random() - 0.5);

    // 5. Lưu vào Database dùng Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Thêm bản ghi BAITHI
      const examInsert = await transaction
        .request()
        .input("MASV", sql.NChar(8), studentId)
        .input("MAMH", sql.NVarChar(50), maMonHoc)
        .input("LAN", sql.SmallInt, Number(lan))
        .input("NGAYTHI", sql.DateTime, new Date())
        .input("TRINHDO", sql.Char(1), trinhDo)
        .input("SOCAUTHI", sql.SmallInt, soCauThi)
        .input("THOIGIAN", sql.SmallInt, registration.THOIGIAN)
        .input("TRANGTHAI", sql.NVarChar(20), "DANG_THI")
        .query(`
          INSERT INTO BAITHI (MASV, MAMH, LAN, NGAYTHI, TRINHDO, SOCAUTHI, THOIGIAN, TRANGTHAI)
          OUTPUT INSERTED.ID
          VALUES (@MASV, @MAMH, @LAN, @NGAYTHI, @TRINHDO, @SOCAUTHI, @THOIGIAN, @TRANGTHAI)
        `);

      const baithiId = examInsert.recordset[0].ID;

      // Thêm chi tiết các câu hỏi vào BAITHI_CHITIET
      for (let i = 0; i < questions.length; i++) {
        await transaction
          .request()
          .input("BAITHI_ID", sql.Int, baithiId)
          .input("CAUHOI", sql.Int, questions[i].CAUHOI)
          .input("STT", sql.Int, i + 1)
          .query(`
            INSERT INTO BAITHI_CHITIET (BAITHI_ID, CAUHOI, STT)
            VALUES (@BAITHI_ID, @CAUHOI, @STT)
          `);
      }

      await transaction.commit();
      res.json({ success: true, redirectUrl: `/client/exam/take/${baithiId}` });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.takeExam = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    const baithiId = req.params.baithiId;
    if (!studentId || !baithiId) {
      return res.redirect("/client/exam");
    }

    const pool = getPool();

    // 1. Lấy thông tin bài thi
    const examRes = await pool
      .request()
      .input("ID", sql.Int, Number(baithiId))
      .input("MASV", sql.NChar(8), studentId)
      .query(`
        SELECT b.*, m.TENMH, s.HO, s.TEN, s.MALOP, l.TENLOP 
        FROM BAITHI b
        JOIN MONHOC m ON b.MAMH = m.MAMH
        JOIN SINHVIEN s ON b.MASV = s.MASV
        JOIN LOP l ON s.MALOP = l.MALOP
        WHERE b.ID = @ID AND RTRIM(b.MASV) = RTRIM(@MASV)
      `);

    const baithi = examRes.recordset[0];
    if (!baithi) {
      return res.status(404).send("Không tìm thấy thông tin ca thi hoặc bài thi không thuộc về bạn.");
    }

    if (baithi.TRANGTHAI === "DA_NOP") {
      return res.redirect("/client/exam-review");
    }

    // 2. Tính thời gian còn lại
    const now = new Date();
    const startTime = new Date(baithi.NGAYTHI);
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const totalSeconds = baithi.THOIGIAN * 60;
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      // Hết giờ $\rightarrow$ tự động nộp bài
      return res.redirect(`/client/exam/submit-auto/${baithiId}`);
    }

    // 3. Lấy danh sách câu hỏi
    const questionsRes = await pool
      .request()
      .input("BAITHI_ID", sql.Int, Number(baithiId))
      .query(`
        SELECT bc.STT, bc.CAUHOI, bc.DAP_AN_CHON, q.NOIDUNG, q.A, q.B, q.C, q.D
        FROM BAITHI_CHITIET bc
        JOIN BODE q ON bc.CAUHOI = q.CAUHOI
        WHERE bc.BAITHI_ID = @BAITHI_ID
        ORDER BY bc.STT
      `);

    const questions = questionsRes.recordset.map((row) => ({
      stt: row.STT,
      id: row.CAUHOI,
      noiDung: row.NOIDUNG,
      options: {
        A: row.A,
        B: row.B,
        C: row.C,
        D: row.D,
      },
      dapAnChon: row.DAP_AN_CHON?.trim() || null,
    }));

    res.render("client/pages/take", {
      pageTitle: "Phòng Thi - Giao diện Làm bài",
      baithi: {
        id: baithi.ID,
        maMonHoc: baithi.MAMH?.trim(),
        tenMonHoc: baithi.TENMH?.trim(),
        hoTen: `${baithi.HO || ""} ${baithi.TEN || ""}`.trim(),
        tenLop: baithi.TENLOP?.trim(),
        soCauThi: baithi.SOCAUTHI,
        thoiGian: baithi.THOIGIAN,
      },
      questions,
      remainingSeconds,
    });
  } catch (e) {
    res.status(500).send("Có lỗi xảy ra: " + e.message);
  }
};

module.exports.saveAnswer = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    const { baithiId, cauHoiId, dapAnChon } = req.body;

    if (!studentId || !baithiId || !cauHoiId) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu lưu câu trả lời." });
    }

    const pool = getPool();

    // Xác nhận bài thi thuộc sinh viên này và đang mở
    const examCheck = await pool
      .request()
      .input("ID", sql.Int, Number(baithiId))
      .input("MASV", sql.NChar(8), studentId)
      .query("SELECT TRANGTHAI FROM BAITHI WHERE ID = @ID AND RTRIM(MASV) = RTRIM(@MASV)");

    const baithi = examCheck.recordset[0];
    if (!baithi || baithi.TRANGTHAI !== "DANG_THI") {
      return res.status(403).json({ success: false, message: "Ca thi không hợp lệ hoặc đã nộp bài." });
    }

    // Cập nhật đáp án được chọn vào BAITHI_CHITIET
    await pool
      .request()
      .input("BAITHI_ID", sql.Int, Number(baithiId))
      .input("CAUHOI", sql.Int, Number(cauHoiId))
      .input("DAP_AN_CHON", sql.Char(1), dapAnChon ? dapAnChon.trim() : null)
      .query(`
        UPDATE BAITHI_CHITIET 
        SET DAP_AN_CHON = @DAP_AN_CHON 
        WHERE BAITHI_ID = @BAITHI_ID AND CAUHOI = @CAUHOI
      `);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.submitExam = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    const baithiId = req.params.baithiId;
    if (!studentId || !baithiId) {
      return res.status(400).json({ success: false, message: "Thông tin nộp bài không hợp lệ." });
    }

    const pool = getPool();

    // 1. Kiểm tra bài thi thuộc sinh viên này và đang làm dở
    const examRes = await pool
      .request()
      .input("ID", sql.Int, Number(baithiId))
      .input("MASV", sql.NChar(8), studentId)
      .query("SELECT * FROM BAITHI WHERE ID = @ID AND RTRIM(MASV) = RTRIM(@MASV)");

    const baithi = examRes.recordset[0];
    if (!baithi || baithi.TRANGTHAI !== "DANG_THI") {
      return res.status(403).json({ success: false, message: "Ca thi không hợp lệ hoặc đã nộp bài từ trước." });
    }

    // 2. Chấm điểm bài thi
    const questionsRes = await pool
      .request()
      .input("BAITHI_ID", sql.Int, Number(baithiId))
      .query(`
        SELECT bc.CAUHOI, bc.DAP_AN_CHON, q.DAP_AN
        FROM BAITHI_CHITIET bc
        JOIN BODE q ON bc.CAUHOI = q.CAUHOI
        WHERE bc.BAITHI_ID = @BAITHI_ID
      `);

    const records = questionsRes.recordset;
    let correctCount = 0;
    const gradingData = [];

    for (const row of records) {
      const selected = row.DAP_AN_CHON?.trim() || "";
      const correct = row.DAP_AN?.trim() || "";
      const isCorrect = selected === correct;
      if (isCorrect) {
        correctCount++;
      }
      gradingData.push({
        cauHoi: row.CAUHOI,
        dungSai: isCorrect ? 1 : 0,
      });
    }

    const totalQuestions = baithi.SOCAUTHI;
    const diem = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

    // 3. Thực thi chấm điểm và ghi nhận vào Database dùng Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Cập nhật DUNG_SAI trong chi tiết
      for (const item of gradingData) {
        await transaction
          .request()
          .input("BAITHI_ID", sql.Int, Number(baithiId))
          .input("CAUHOI", sql.Int, item.cauHoi)
          .input("DUNG_SAI", sql.Bit, item.dungSai)
          .query(`
            UPDATE BAITHI_CHITIET 
            SET DUNG_SAI = @DUNG_SAI 
            WHERE BAITHI_ID = @BAITHI_ID AND CAUHOI = @CAUHOI
          `);
      }

      // Cập nhật trạng thái BAITHI
      await transaction
        .request()
        .input("ID", sql.Int, Number(baithiId))
        .input("DIEM", sql.Decimal(3, 1), diem)
        .query("UPDATE BAITHI SET TRANGTHAI = 'DA_NOP', DIEM = @DIEM WHERE ID = @ID");

      // Cập nhật hoặc chèn bảng BANGDIEM
      const bangDiemCheck = await transaction
        .request()
        .input("MASV", sql.NChar(8), studentId)
        .input("MAMH", sql.NVarChar(50), baithi.MAMH)
        .input("LAN", sql.SmallInt, baithi.LAN)
        .query(`
          SELECT 1 FROM BANGDIEM 
          WHERE RTRIM(MASV) = RTRIM(@MASV) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
        `);

      if (bangDiemCheck.recordset[0]) {
        await transaction
          .request()
          .input("MASV", sql.NChar(8), studentId)
          .input("MAMH", sql.NVarChar(50), baithi.MAMH)
          .input("LAN", sql.SmallInt, baithi.LAN)
          .input("DIEM", sql.Decimal(3, 1), diem)
          .input("NGAYTHI", sql.Date, new Date())
          .query(`
            UPDATE BANGDIEM 
            SET DIEM = @DIEM, NGAYTHI = @NGAYTHI 
            WHERE RTRIM(MASV) = RTRIM(@MASV) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
          `);
      } else {
        await transaction
          .request()
          .input("MASV", sql.NChar(8), studentId)
          .input("MAMH", sql.NVarChar(50), baithi.MAMH)
          .input("LAN", sql.SmallInt, baithi.LAN)
          .input("DIEM", sql.Decimal(3, 1), diem)
          .input("NGAYTHI", sql.Date, new Date())
          .query(`
            INSERT INTO BANGDIEM (MASV, MAMH, LAN, NGAYTHI, DIEM)
            VALUES (@MASV, @MAMH, @LAN, @NGAYTHI, @DIEM)
          `);
      }

      await transaction.commit();
      res.json({ success: true, redirectUrl: "/client/exam-review" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.submitAuto = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    const baithiId = req.params.baithiId;
    if (!studentId || !baithiId) {
      return res.redirect("/client/exam");
    }

    const pool = getPool();

    // 1. Kiểm tra bài thi thuộc sinh viên này và đang làm dở
    const examRes = await pool
      .request()
      .input("ID", sql.Int, Number(baithiId))
      .input("MASV", sql.NChar(8), studentId)
      .query("SELECT * FROM BAITHI WHERE ID = @ID AND RTRIM(MASV) = RTRIM(@MASV)");

    const baithi = examRes.recordset[0];
    if (!baithi || baithi.TRANGTHAI !== "DANG_THI") {
      return res.redirect("/client/exam-review");
    }

    // 2. Chấm điểm bài thi
    const questionsRes = await pool
      .request()
      .input("BAITHI_ID", sql.Int, Number(baithiId))
      .query(`
        SELECT bc.CAUHOI, bc.DAP_AN_CHON, q.DAP_AN
        FROM BAITHI_CHITIET bc
        JOIN BODE q ON bc.CAUHOI = q.CAUHOI
        WHERE bc.BAITHI_ID = @BAITHI_ID
      `);

    const records = questionsRes.recordset;
    let correctCount = 0;
    const gradingData = [];

    for (const row of records) {
      const selected = row.DAP_AN_CHON?.trim() || "";
      const correct = row.DAP_AN?.trim() || "";
      const isCorrect = selected === correct;
      if (isCorrect) {
        correctCount++;
      }
      gradingData.push({
        cauHoi: row.CAUHOI,
        dungSai: isCorrect ? 1 : 0,
      });
    }

    const totalQuestions = baithi.SOCAUTHI;
    const diem = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

    // 3. Lưu vào Database dùng Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const item of gradingData) {
        await transaction
          .request()
          .input("BAITHI_ID", sql.Int, Number(baithiId))
          .input("CAUHOI", sql.Int, item.cauHoi)
          .input("DUNG_SAI", sql.Bit, item.dungSai)
          .query(`
            UPDATE BAITHI_CHITIET 
            SET DUNG_SAI = @DUNG_SAI 
            WHERE BAITHI_ID = @BAITHI_ID AND CAUHOI = @CAUHOI
          `);
      }

      await transaction
        .request()
        .input("ID", sql.Int, Number(baithiId))
        .input("DIEM", sql.Decimal(3, 1), diem)
        .query("UPDATE BAITHI SET TRANGTHAI = 'DA_NOP', DIEM = @DIEM WHERE ID = @ID");

      const bangDiemCheck = await transaction
        .request()
        .input("MASV", sql.NChar(8), studentId)
        .input("MAMH", sql.NVarChar(50), baithi.MAMH)
        .input("LAN", sql.SmallInt, baithi.LAN)
        .query(`
          SELECT 1 FROM BANGDIEM 
          WHERE RTRIM(MASV) = RTRIM(@MASV) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
        `);

      if (bangDiemCheck.recordset[0]) {
        await transaction
          .request()
          .input("MASV", sql.NChar(8), studentId)
          .input("MAMH", sql.NVarChar(50), baithi.MAMH)
          .input("LAN", sql.SmallInt, baithi.LAN)
          .input("DIEM", sql.Decimal(3, 1), diem)
          .input("NGAYTHI", sql.Date, new Date())
          .query(`
            UPDATE BANGDIEM 
            SET DIEM = @DIEM, NGAYTHI = @NGAYTHI 
            WHERE RTRIM(MASV) = RTRIM(@MASV) AND RTRIM(MAMH) = RTRIM(@MAMH) AND LAN = @LAN
          `);
      } else {
        await transaction
          .request()
          .input("MASV", sql.NChar(8), studentId)
          .input("MAMH", sql.NVarChar(50), baithi.MAMH)
          .input("LAN", sql.SmallInt, baithi.LAN)
          .input("DIEM", sql.Decimal(3, 1), diem)
          .input("NGAYTHI", sql.Date, new Date())
          .query(`
            INSERT INTO BANGDIEM (MASV, MAMH, LAN, NGAYTHI, DIEM)
            VALUES (@MASV, @MAMH, @LAN, @NGAYTHI, @DIEM)
          `);
      }

      await transaction.commit();
      res.redirect("/client/exam-review");
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch {
    res.redirect("/client/exam");
  }
};

module.exports.examReview = (req, res) => {
  res.render("client/pages/exam-review", {
    pageTitle: "Xem lại bài thi",
  });
};

module.exports.getExamReviewList = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập sinh viên." });
    }
    const pool = getPool();
    const result = await pool.request()
      .input("MASV", sql.NChar(8), studentId)
      .query(`
        SELECT b.ID, b.MAMH, m.TENMH, b.LAN, b.NGAYTHI, b.DIEM, b.TRINHDO, b.SOCAUTHI, b.THOIGIAN
        FROM BAITHI b
        JOIN MONHOC m ON b.MAMH = m.MAMH
        WHERE b.MASV = @MASV AND b.TRANGTHAI = 'DA_NOP'
        ORDER BY b.NGAYTHI DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.getExamReviewDetail = async (req, res) => {
  try {
    const studentId = req.user?.maSinhVien;
    if (!studentId) {
      return res.status(401).send("Vui lòng đăng nhập sinh viên.");
    }
    const examId = req.params.id;
    const pool = getPool();
    const examHeader = await pool.request()
      .input("ID", sql.Int, examId)
      .query(`
        SELECT b.ID, b.MASV, s.HO, s.TEN, sv_lop.TENLOP, b.MAMH, m.TENMH, b.LAN, b.NGAYTHI, b.TRINHDO, b.SOCAUTHI, b.THOIGIAN, b.DIEM
        FROM BAITHI b
        JOIN SINHVIEN s ON b.MASV = s.MASV
        JOIN LOP sv_lop ON s.MALOP = sv_lop.MALOP
        JOIN MONHOC m ON b.MAMH = m.MAMH
        WHERE b.ID = @ID
      `);
    
    if (!examHeader.recordset[0]) {
      return res.status(404).send("Không tìm thấy bài thi.");
    }
    
    const exam = examHeader.recordset[0];
    if (exam.MASV.trim() !== studentId.trim()) {
      return res.status(403).send("Bạn không có quyền xem chi tiết bài thi này.");
    }
    
    const examDetails = await pool.request()
      .input("BAITHI_ID", sql.Int, examId)
      .query(`
        SELECT bc.STT, bc.CAUHOI, bc.DAP_AN_CHON, bc.DUNG_SAI, q.NOIDUNG, q.A, q.B, q.C, q.D, q.DAP_AN
        FROM BAITHI_CHITIET bc
        JOIN BODE q ON bc.CAUHOI = q.CAUHOI
        WHERE bc.BAITHI_ID = @BAITHI_ID
        ORDER BY bc.STT
      `);
    
    res.render("client/pages/exam-detail", {
      pageTitle: "Chi tiết bài thi",
      exam,
      questions: examDetails.recordset,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
