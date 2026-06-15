// KHỞI TẠO NOTYF (THÔNG BÁO)
const notify = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top"
  },
  dismissible: true
});
// END KHỞI TẠO NOTYF



// HIỂN THỊ THÔNG BÁO TỪ SESSION STORAGE
let notifySession = sessionStorage.getItem("notify");

if(notifySession) {
  notifySession = JSON.parse(notifySession);

  if(notifySession.code == "success") {
    notify.success(notifySession.message);
  }

  if(notifySession.code == "error") {
    notify.error(notifySession.message);
  }

  sessionStorage.removeItem("notify");
}
// END HIỂN THỊ THÔNG BÁO



// DRAW NOTIFY
const drawNotify = (code, message) => {
  const data = {
    code: code,
    message: message
  };

  sessionStorage.setItem("notify", JSON.stringify(data));
}
// END DRAW NOTIFY




// ROLE LOGIN FORM
const loginForm = document.querySelector("#loginForm");

if(loginForm) {
  // ROLE
  const studentRadio = document.querySelector("#student");
  const lecturerAdminRadio = document.querySelector("#lecturer-admin");

  // SUB FORM
  const formStudent = document.querySelector("#formStudent");
  const formLecturerAdmin = document.querySelector("#formLecturerAmin");


  // CHECK ROLE
  const isStudentLogin = () => studentRadio.checked;

  const isLecturerLogin = () => lecturerAdminRadio.checked;
  // END CHECK ROLE



  // CHANGE ROLE
  const handleRoleChange = () => {
    // STUDENT
    if(isStudentLogin()) {
      formStudent.classList.add("active");
      formLecturerAdmin.classList.remove("active");
    }
    // END STUDENT


    // LECTURER ADMIN
    if(isLecturerLogin()) {
      formLecturerAdmin.classList.add("active");
      formStudent.classList.remove("active");
    }
    // END LECTURER ADMIN
  }
  // END CHANGE ROLE



  // DEFAULT ROLE
  handleRoleChange();
  // END DEFAULT ROLE



  // EVENT CHANGE ROLE
  studentRadio.addEventListener("change", () => {
    handleRoleChange();
  });

  lecturerAdminRadio.addEventListener("change", () => {
    handleRoleChange();
  });
  // END EVENT CHANGE ROLE




  // VALIDATE FORM
  const validator = new JustValidate("#loginForm");

  validator

    // STUDENT ID
    .addField("#student_id", [
      {
        validator: (value) => {
          if(!isStudentLogin()) return true;

          return value.trim() !== "";
        },
        errorMessage: "Vui lòng nhập mã sinh viên!"
      }
    ])
    // END STUDENT ID



    // USERNAME
    .addField("#username", [
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return value.trim() !== "";
        },
        errorMessage: "Vui lòng nhập tài khoản!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return value.trim().length >= 5;
        },
        errorMessage: "Tài khoản phải có ít nhất 5 ký tự!"
      }
    ])
    // END USERNAME



    // PASSWORD
    .addField("#password", [
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return value.trim() !== "";
        },
        errorMessage: "Vui lòng nhập mật khẩu!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return value.length >= 8;
        },
        errorMessage: "Mật khẩu phải có ít nhất 8 ký tự!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return /[a-z]/.test(value);
        },
        errorMessage: "Mật khẩu phải chứa ký tự thường!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return /[A-Z]/.test(value);
        },
        errorMessage: "Mật khẩu phải chứa ký tự hoa!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return /\d/.test(value);
        },
        errorMessage: "Mật khẩu phải chứa chữ số!"
      },
      {
        validator: (value) => {
          if(!isLecturerLogin()) return true;

          return /[\W_]/.test(value);
        },
        errorMessage: "Mật khẩu phải chứa ký tự đặc biệt!"
      }
    ])
    // END PASSWORD




    // SUBMIT FORM
    .onSuccess((event) => {

      // LOGIN STUDENT
      if(isStudentLogin()) {
        const studentId = event.target.student_id.value;

        console.log(studentId);

        notify.success("Đăng nhập sinh viên thành công!");

        // DEMO
        drawNotify("success", "Đăng nhập sinh viên thành công!");
      }
      // END LOGIN STUDENT




      // LOGIN LECTURER ADMIN
      if(isLecturerLogin()) {
        const username = event.target.username.value;
        const password = event.target.password.value;

        console.log(username);
        console.log(password);

        notify.success("Đăng nhập giảng viên thành công!");

        // DEMO
        drawNotify("success", "Đăng nhập giảng viên thành công!");
      }
      // END LOGIN LECTURER ADMIN

    })
  // END VALIDATE FORM
}
// END ROLE LOGIN FORM