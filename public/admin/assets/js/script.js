// TINYMCE (BỘ SOẠN THẢO VĂN BẢN)
const initTinyMCE = (selector) => {
	tinymce.init({
    selector:selector,
		plugins: ["anchor", "link", "charmap", "image", "lists"], // MUỐN THÊM VÀO TOOLBAR PHẢI THÊM VÀO PLUGINS TRƯỚC
    toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link anchor charmap image | numlist bullist'
	});
}
initTinyMCE('[textarea-mce]');
// END TINYMCE


// MENU MOBILE DASHBOARD
const  buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if(buttonMenuMobile) {
    const sider = document.querySelector(".sider");
    const siderOverlay = document.querySelector(".sider-overlay");

    buttonMenuMobile.addEventListener("click", () => {
        sider.classList.add("active");
        siderOverlay.classList.add("active");
    })

    siderOverlay.addEventListener("click", () => {
        sider.classList.remove("active");
        siderOverlay.classList.remove("active");
    })
}
// END MENU MOBILE DASHBOARD


// ADD SCHEDULE SECTION 8
const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");
if(scheduleSection8) {
    const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
    const elementList = scheduleSection8.querySelector(".inner-schedule-list");

		// TẠO ITEM
    buttonCreate.addEventListener("click", () => {
        const firstitem = elementList.querySelector(".inner-schedule-item");
        const cloneItem = firstitem.cloneNode(true);
        cloneItem.querySelector("input").value = "";
				const id = `mce_${Date.now()}`;
        cloneItem.querySelector(".inner-schedule-body").innerHTML = `
					<textarea id="${id}"></textarea>
				`;
        elementList.appendChild(cloneItem);
				initTinyMCE(`#${id}`);
    })

    elementList.addEventListener("click", (event) => {
        // ĐÓNG/MỞ
        if(event.target.closest(".inner-more")) {
            const parentItem = event.target.closest(".inner-schedule-item");
            parentItem.classList.toggle("hidden");
        }
				// END ĐÓNG/MỞ


        // XÓA ITEM
        if(event.target.closest(".inner-remove")) {
            const totalItem = elementList.querySelectorAll(".inner-schedule-item").length;
            if(totalItem > 1) {
                const parentItem = event.target.closest(".inner-schedule-item");
                parentItem.remove();
            }
        }
				// END XÓA ITEM
    })
		// END TẠO ITEM


		// SẮP XẾP ITEM (KÉO THẢ ITEM)
		new Sortable(elementList, {
			handle: '.inner-move', // handle's class // Chỉ khi giữ nút có class .inner-move mới kéo thả được
			animation: 150,
			// KHỞI TẠO LẠI TNYMCE KHI MỚI SORT ITEM
			onStart: (event) => {
				const textarea = event.item.querySelector("textarea");
				const id = textarea.id;
				tinymce.get(id).remove();
			},
			onEnd: (event) => {
				const textarea = event.item.querySelector("textarea");
				const id = textarea.id;
				initTinyMCE(`#${id}`);
			}
			// END KHỞI TẠO LẠI
		});

		// new Sortable(elementList) Giữ ở đâu trong item cũng kéo được
		// END SẮP XẾP
}
// END ADD SCHEDULE SECTION 8


// FILEPOND-IMAGE
const listFilepondImage = document.querySelectorAll("[filepond-image]");
const filePond = {};
if(listFilepondImage.length > 0) {
  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginFileValidateType);

  listFilepondImage.forEach(filepondImage => {
    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: "+",
      acceptedFileTypes: ['image/*'],
    });
  })
  
}
// END FILEPOND-IMAGE


// REVENUE CHART
const revenueChart = document.querySelector("#revenue-chart");
if(revenueChart) {
  new Chart(revenueChart, {
    type: 'line',
    data: {
      labels: ['01', '02', '03', '04', '05', '06'],
      datasets: [
        {
        label: 'Thang 4/2026',
        data: [1200000, 1900000, 3000000, 1500000, 2000000, 3200000],
        borderWidth: 1.5,
        borderColor: "#36A1EA"
        },
        {
        label: 'Thang 3/2026',
        data: [1500000, 2600000, 2000000, 3500000, 2100000, 1800000],
        borderWidth: 1.5,
        borderColor: "#FE5383"
        }
      ]
      
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      maintainAspectRatio: false // CHU RO NET
    }
  });
}
// END REVENUE CHART


// CATEGORY CREATE FORM
const categoryCreateForm = document.querySelector("#category-create-form");
if(categoryCreateForm) {
    const validator = new JustValidate('#category-create-form');

    validator
			.addField('#name', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập tên danh mục!"
				}
			])
			.onSuccess((event) => {
        const name = event.target.name.value;
        const parent = event.target.parent.value;
        const position = event.target.position.value;
        const status = event.target.status.value;
        const avatar = filePond.avatar.getFile()?.file;
        const description = tinymce.get("description").getContent();
				
        console.log(name);
        console.log(parent);
        console.log(position);
        console.log(status);
        console.log(avatar);
        console.log(description);
			})
}
// END CATEGGORY CREATE FORM


// TOUR CREATE FORM
const tourCreateForm = document.querySelector("#tour-create-form");
if(tourCreateForm) {
    const validator = new JustValidate('#tour-create-form');

    validator
			.addField('#name', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập tên tour!"
				}
			])
			.onSuccess((event) => {
        const name = event.target.name.value;
        const category = event.target.category.value;
        const position = event.target.position.value;
        const status = event.target.status.value;
        const priceOldChildren = event.target.priceOldChildren.value;
        const priceOldAdult = event.target.priceOldAdult.value;
        const priceOldBaby = event.target.priceOldBaby.value;
        const priceNewAdult = event.target.priceNewAdult.value;
        const priceNewChildren = event.target.priceNewChildren.value;
        const priceNewBaby = event.target.priceNewBaby.value;
        const stockAdult = event.target.stockAdult.value;
        const stockChildren = event.target.stockChildren.value;
        const stockBaby = event.target.stockBaby.value;
        const locations = [];
        const time = event.target.time.value;
        const vehicle = event.target.vehicle.value;
        const departureDate = event.target.departureDate.value;
        const avatar = filePond.avatar.getFile()?.file;
        const information = tinymce.get("information").getContent();
        const schedules = [];

        // LOCATIONS
        const listLocationChecked = document.querySelectorAll(`[name="locations"]:checked`);
        listLocationChecked.forEach(input => {
          locations.push(input.value);
        })
        // END LOCATIONS


        // SCHEDULE
        const listScheduleItem = document.querySelectorAll(".inner-schedule .inner-schedule-item");
        listScheduleItem.forEach(item => {
          const inputTitle = item.querySelector("input");
          const textareaDescription = item.querySelector("textarea");
          const idDescription = textareaDescription.id;
          const description = tinymce.get(idDescription).getContent();

          schedules.push({
            title: title,
            description: description
          });
        })
        // END SCHEDULE
				
        console.log(name);
        console.log(category);
        console.log(position);
        console.log(status);
        console.log(avatar);
        console.log(priceOldAdult);
        console.log(priceOldChildren);
        console.log(priceOldBaby);
        console.log(priceNewAdult);
        console.log(priceNewChildren);
        console.log(priceNewBaby);
        console.log(stockAdult);
        console.log(stockChildren);
        console.log(stockBaby);
        console.log(locations);
        console.log(time);
        console.log(vehicle);
        console.log(departureDate);
        console.log(information);
        console.log(schedules);
			})
}
// END TOUR CREATE FORM


// ORDER EDIT FORM
const orderEditForm = document.querySelector("#order-edit-form");
if(orderEditForm) {
    const validator = new JustValidate('#order-edit-form');

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
			.addField('#phone', [
				{
					rule: "required",
					errorMessage: "Vui lòng nhập số điện thoại!"
				},
                {
                    rule: 'customRegexp',
                    value: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                    errorMessage: "Số điện thoại không đúng định dạng!"
                },
			])
      .onSuccess((event) => {
          const fullName = event.target.fullName.value;
          const phone = event.target.phone.value;
          const note = event.target.note.value;
          const paymentMethod = event.target.paymentMethod.value;
          const paymentStatus = event.target.paymentStatus.value;
          const status = event.target.status.value;
			});
}
// END ORDER EIDT FORM



// SETTING WEBSITE INFO FORM
const settingWebsiteInfoForm = document.querySelector("#setting-website-info-form");
if(settingWebsiteInfoForm) {
    const validator = new JustValidate('#setting-website-info-form');

    validator
			.addField('#nameWeb', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập tên web!"
				}
			])
      .addField('#email', [
				{
					rule: 'email',
					errorMessage: "Email không đúng định dạng!"
				},
					
			])
			.onSuccess((event) => {
        const nameWeb = event.target.nameWeb.value;
        const phone = event.target.phone.value;
        const email = event.target.email.value;
        const address = event.target.address.value;
        const logo = filePond.logo.getFile()?.file;
        const favicon = filePond.favicon.getFile()?.file;

        console.log(nameWeb);
        console.log(phone);
        console.log(email);
        console.log(address);
        console.log(logo);
        console.log(favicon);
        
			})
}
// END SETTING WEBSITE INFO FORM


// SETTING ACCOUNT ADMIN CREATE FORM
const settingAccountAdminCreateForm = document.querySelector("#setting-account-admin-create-form");
if(settingAccountAdminCreateForm) {
    const validator = new JustValidate('#setting-account-admin-create-form');

    validator
			.addField('#name', [
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
      .addField('#position', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập chức vụ!"
				}
					
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
			.onSuccess((event) => {
				const name= event.target.name.value;
				const email = event.target.email.value;
        const phone = event.target.phone.value;
        const usergear = event.target.usergear.value;
        const position = event.target.position.value;
        const status = event.target.status.value;
				const password = event.target.password.value;
        const avatar = filePond.avatar.getFile()?.file;

        console.log(name);
        console.log(email);
        console.log(phone);
        console.log(usergear);
        console.log(position);
        console.log(status);
				console.log(password);
        console.log(avatar);
			})
}
// END  SETTING ACCOUNT ADMIN CREATE FORM


// TOUR CREATE FORM
const settingRoleCreateForm = document.querySelector("#setting-role-create-form");
if(settingRoleCreateForm) {
    const validator = new JustValidate('#setting-role-create-form');

    validator
			.addField('#name', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập tên nhóm quyền!"
				}
			])
			.onSuccess((event) => {
        const name = event.target.name.value;
        const description = event.target.description.value;
        const roles = [];

        // ROLES
        const listRoleChecked = document.querySelectorAll(`[name="roles"]:checked`);
        listRoleChecked.forEach(input => {
          roles.push(input.value);
        })
        // END ROLES


        
				
        console.log(name);
        console.log(description);
        console.log(roles);
			})
}
// END TOUR CREATE FORM


// PROFILE EDIT FORM
const profileEditForm = document.querySelector("#profile-edit-form");
if(profileEditForm) {
    const validator = new JustValidate('#profile-edit-form');

    validator
			.addField('#name', [
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
			.onSuccess((event) => {
				const name= event.target.name.value;
				const email = event.target.email.value;
        const phone = event.target.phone.value;
        const avatar = filePond.avatar.getFile()?.file;

        console.log(name);
        console.log(email);
        console.log(phone);
        console.log(avatar);
			})
}
// PROFILE EDIT FORM


// PROFILE CHANGE PASSWORD FORM
const profileChangePasswordForm = document.querySelector("#profile-change-password-form");
if(profileChangePasswordForm) {
    const validator = new JustValidate('#profile-change-password-form');

    validator
			.addField('#newpw', [
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
			.addField('#confirm-newpw', [
				{
					rule: 'required',
					errorMessage: "Vui lòng nhập mật khẩu!"
				},
				{
					validator: (value, context) => {
						const password = context["#newpw"].elem.value;
						return value == password ? true : false;
					},
					errorMessage: "Mật khẩu xác nhận không trùng khớp!"
				},
			])
			.onSuccess((event) => {
				const newpw= event.target.newpw.value;

				console.log(newpw);
			})
}
// END PROFILE CHANGE PASSWORD FORM


// SIDER
const sider = document.querySelector(".sider");
if (sider) {
  const pathNameCurrent = window.location.pathname;
  const pathNameCurrentSplit = pathNameCurrent.split("/");
  const menuList = sider.querySelectorAll("a");

  menuList.forEach(item => {
    const pathName = item.getAttribute("href");
    const pathNameSplit = pathName.split("/");
    if(pathNameCurrentSplit[1] == pathNameSplit[1] && pathNameCurrentSplit[2] == pathNameSplit[2]) {
      item.classList.add("inner-active");
    }
  })
}

// END SIDER