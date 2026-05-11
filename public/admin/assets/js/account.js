// KHỞI TẠO NOTYF (THÔNG BÁO)
var notify = new Notyf({
	duration: 3000, 
	position: {
		x: 'right',
		y: 'top'
	},
	dismissible: true
});
// END NOTYF

// HIỂN THỊ THÔNG BÁO TRONG SESSIONSTORAGE
let notifySession = sessionStorage.getItem("notify");
if(notifySession) {
	notifySession = JSON.parse(notifySession);
	if(notifySession.code == "error") {
		notify.error(notifySession.message);
	}
	if(notifySession.code == "success") {
		notify.success(notifySession.message);
	}
	sessionStorage.removeItem("notify");
}
// END HIỂN THỊ


// VẼ THÔNG BÁO
const drawNotify = (code, message) => {
	const data = {
		code: code,
		message: message
	}
	sessionStorage.setItem("notify", JSON.stringify(data));
}
// END

// LOGIN FORM
const loginForm = document.querySelector("#loginForm");
if(loginForm) {
    const validator = new JustValidate('#loginForm');

    validator
			.addField('#email', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập email!"
				},
				{
					rule: 'email',
					errorMessage: "Email không đúng định dạng!"
				},
					
			])
			.addField('#password', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mật khẩu!"
				}
			])
			.onSuccess((event) => {
				const email = event.target.email.value;
				const password = event.target.password.value;
				const rememberPassword = event.target.rememberPassword.checked;

				console.log(email)
				console.log(password)
				console.log(rememberPassword)
			})
}
// END LOGIN FORM


// REGISTER FORM
const registerForm = document.querySelector("#registerForm");
if(registerForm) {
    const validator = new JustValidate('#registerForm');

    validator
			.addField('#fullName', [
				{
					rule: "required",
					errorMessage: "Vui lòng nhập họ tên!"
				},
                {
                    rule: 'minLength',
                    value: 5,
                    errorMessage: "Vui lòng nhập ít nhất 5 kí tự!"
                },
                {
                    rule: 'maxLength',
                    value: 50,
                    errorMessage: "Vui lòng nhập tối đa 50 kí tự!"
                }
			])
			.addField('#email', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập email!"
				},
				{
					rule: 'email',
					errorMessage: "Email không đúng định dạng!"
				},
					
			])
			.addField('#password', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mật khẩu!"
				},
				{
                    rule: 'minLength',
                    value: 8,
                    errorMessage: "Vui lòng nhập ít nhất 8 kí tự!"
                },
				{
					rule: 'customRegexp',
					value: /[a-z]/,
					errorMessage: "Mật khẩu phải chứa ký tự thường!"
				},
				{
					rule: 'customRegexp',
					value: /[A-Z]/,
					errorMessage: "Mật khẩu phải chứa ký tự hoa!"
				},
				{
					rule: 'customRegexp',
					value: /\d/,
					errorMessage: "Mật khẩu phải chứa chữ số!"
				},
				{
					rule: 'customRegexp',
					value: /[\W_]/,
					errorMessage: "Mật khẩu phải chứa ký tự đặc biệt!"
				}
			])
			.addField('#agree', [
				{
					rule: 'required',
					errorMessage: "Vui lòng chấp nhận để đăng ký tài khoản!"
				}
			])
			.onSuccess((event) => {
				const fullName= event.target.fullName.value;
				const email = event.target.email.value;
				const password = event.target.password.value;

				const dataFinal = {
					fullName: fullName,
					email: email,
					password: password
				}

				fetch(`/${pathAdmin}/account/register`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(dataFinal)
				})
					.then(res => res.json())
					.then(data => {
						if(data.code == "error") {
							notify.error(data.message); // IN RA THÔNG BÁO NHƯNG KHÔNG LOAD LẠI TRANG
						}

						if(data.code == "success") {
							drawNotify(data.code, data.message); // IN RA CÂU THÔNG BÁO NHƯNG LOAD LẠI TRANG
							window.location.href = `/${pathAdmin}/account/register-success`;
						}
					})
			})
}
// END RGISTER FORM


// LOGIN FORM
const forgetPasswordForm = document.querySelector("#forgetPasswordForm");
if(forgetPasswordForm) {
    const validator = new JustValidate('#forgetPasswordForm');

    validator
			.addField('#email', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập email!"
				},
				{
					rule: 'email',
					errorMessage: "Email không đúng định dạng!"
				},
					
			])
			.onSuccess((event) => {
				const email = event.target.email.value;
			})
}
// END LOGIN FORM


// OTP PASSWORD FORM
const otpPasswordForm = document.querySelector("#otpPasswordForm");
if(otpPasswordForm) {
    const validator = new JustValidate('#otpPasswordForm');

    validator
			.addField('#otp', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mã OTP!"
				}
					
			])
			.onSuccess((event) => {
				const otp = event.target.otp.value;
			})
}
// END OTP PASSWORD FORM


// CHANGE PASSWORD FORM
const changePasswordForm = document.querySelector("#changePasswordForm");
if(changePasswordForm) {
    const validator = new JustValidate('#changePasswordForm');

    validator
			.addField('#newPassword', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mật khẩu!"
				},
				{
                    rule: 'minLength',
                    value: 8,
                    errorMessage: "Vui lòng nhập ít nhất 8 kí tự!"
                },
				{
					rule: 'customRegexp',
					value: /[a-z]/,
					errorMessage: "Mật khẩu phải chứa ký tự thường!"
				},
				{
					rule: 'customRegexp',
					value: /[A-Z]/,
					errorMessage: "Mật khẩu phải chứa ký tự hoa!"
				},
				{
					rule: 'customRegexp',
					value: /\d/,
					errorMessage: "Mật khẩu phải chứa chữ số!"
				},
				{
					rule: 'customRegexp',
					value: /[\W_]/,
					errorMessage: "Mật khẩu phải chứa ký tự đặc biệt!"
				}
			])
			.addField('#confirmPassword', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mật khẩu!"
				},
				{
					validator: (value, context) => {
						const password = context["#newPassword"].elem.value;
						return value == password ? true : false;
					},
					errorMessage: "Mật khẩu xác nhận không trùng khớp!"
				},
			])
			.onSuccess((event) => {
				const fullName= event.target.fullName.value;
				const email = event.target.email.value;
				const password = event.target.password.value;

				console.log(email)
				console.log(password)
				console.log(rememberPassword)
			})
}
// END CHANGE PASSWORD FORM