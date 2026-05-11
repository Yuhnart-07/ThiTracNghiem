// MENU MOBILE
const buttonMoblie = document.querySelector(".header .inner-button-menu");
if (buttonMoblie) {
    const menu = document.querySelector(".header .inner-menu");
    const overlay = menu.querySelector(".inner-overlay");

    buttonMoblie.addEventListener("click", () =>  {
        menu.classList.add("active");
    })

    overlay.addEventListener("click", () => {
        menu.classList.remove("active");
    })

    const listButtonSubMenu = menu.querySelectorAll("ul > li > i");
    listButtonSubMenu.forEach(button => {
        button.addEventListener("click", () => {
            button.closest("li").classList.toggle("active");
        })
    })
}
// END MENU MOBLIE


// BOX ADDRESS SECTION 1
const boxAddressSection1 = document.querySelector(".section-1 .inner-form .inner-address");
if(boxAddressSection1) {
    //  ẨN / HIỆN BOX SUGGEST
    const input = boxAddressSection1.querySelector(".inner-group .inner-input");

    input.addEventListener("focus" , () => {
        boxAddressSection1.classList.add("active");
    })

    input.addEventListener("blur" , () => {
        boxAddressSection1.classList.remove("active");
    })

    // BẮT SỰ KIỆN CHO TỪNG ITEM
    const listItem = boxAddressSection1.querySelectorAll(".inner-suggest .inner-suggest-list .inner-item");
    listItem.forEach(item => {
        item.addEventListener("mousedown", () => {
            const title = item.querySelector(".inner-item-title").innerHTML.trim();
            input.value = title; 
        })
    })
}
// END BOX ADDRESS SECTION 1


// BOX USER SECTION 1
const boxUserSection1 = document.querySelector(".section-1 .inner-form .inner-user");
if(boxUserSection1) {
    //  HIỆN BOX 
    const input = boxUserSection1.querySelector(".inner-group .inner-input");

    input.addEventListener("focus" , () => {
        boxUserSection1.classList.add("active");
    })

    // ẨN BOX
    document.addEventListener("click", (event) => {
        if(!boxUserSection1.contains(event.target)) {
            boxUserSection1.classList.remove("active");
        }
    })
    
    // THÊM SỐ LƯỢNG VÀO Ô INPUT
    const updateQuantityInput = () => {
        const listBoxNumber = boxUserSection1.querySelectorAll(".inner-quantity .inner-count .inner-number");
        const listNumber = [];
        listBoxNumber.forEach(boxNumber => {
            const number = parseInt(boxNumber.innerHTML);
            listNumber.push(number);
        })
        const value = `NL: ${listNumber[0]} , TE: ${listNumber[1]} , EB : ${listNumber[2]}`
        input.value = value;
    }

    // BẮT SỰ KIỆN CLICK NÚT UP
    const listButtonUp = boxUserSection1.querySelectorAll(".inner-quantity .inner-count .inner-up")
    listButtonUp.forEach(button => {
        button.addEventListener("click", () => {
            const parent = button.closest(".inner-count");
            const boxNumber = parent.querySelector(".inner-number");
            const number = parseInt(boxNumber.innerHTML);
            boxNumber.innerHTML = number + 1;
            updateQuantityInput();
        })
    })

    // BẮT SỰ KIỆN CLICK NÚT DOWn
    const listButtonDown = boxUserSection1.querySelectorAll(".inner-quantity .inner-count .inner-down")
    listButtonDown.forEach(button => {
        button.addEventListener("click", () => {
            const parent = button.closest(".inner-count");
            const boxNumber = parent.querySelector(".inner-number");
            const number = parseInt(boxNumber.innerHTML);
            if (number > 0) {
                boxNumber.innerHTML = number - 1;
                updateQuantityInput();
            }
        })
    })
}
// END USER SECTION 1 


// CLOCK EXPIRE SECTION 2
const clockExpire = document.querySelector("[clock-expire]");
if (clockExpire) {
	const listBoxNumber = clockExpire.querySelectorAll(".inner-number");
	const expireDateTimeString = clockExpire.getAttribute("clock-expire");
	const expireDateTime = new Date(expireDateTimeString);

	const updateClock = () => {
		const now = new Date();
		const remainingTime = expireDateTime - now;
		if(remainingTime > 0) {
			const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
		const hours = Math.floor(remainingTime / (60 * 60 * 1000) % 24);
		const minutes = Math.floor(remainingTime / (60 * 1000) % 60); 
		const seconds = Math.floor(remainingTime / (1000) % 60); 
		listBoxNumber[0].innerHTML = days < 10 ? `0${days}` : days;
		listBoxNumber[1].innerHTML = hours	 < 10 ? `0${hours}` : hours;
		listBoxNumber[2].innerHTML = minutes < 10 ? `0${minutes}` : minutes;
		listBoxNumber[3].innerHTML = seconds < 10 ? `0${seconds}` : seconds;
		}
		else {
			clearInterval(intervalClock);
		}
	}

	const intervalClock = setInterval(updateClock,1000);

}
// END LOCK EXPIRE SECTION 2


// BOX FILTER SECTION 9
const buttonFilterMoblie = document.querySelector(".section-9 .inner-right .inner-button-filter");
if (buttonFilterMoblie) {
    const boxLeft = document.querySelector(".section-9 .inner-left");
    const overlay = boxLeft.querySelector(".inner-overlay");

    buttonFilterMoblie.addEventListener("click", () =>  {
        boxLeft.classList.add("active");
    })

    overlay.addEventListener("click", () => {
        boxLeft.classList.remove("active");
    });
}
// END BOX FILTER SECTION 9


// BOX TOUR INFO SECTION 10
const boxTourInfo = document.querySelector(".section-10 .box-tour-info");
if (boxTourInfo) {
    // NÚT XEM TẤT CẢ
    const buttonReadMore = boxTourInfo.querySelector(".inner-read-more button ");

    buttonReadMore.addEventListener("click", () => {
        if(boxTourInfo.classList.contains("active")) {
            boxTourInfo.classList.remove("active");
            buttonReadMore.innerHTML = "Xem tất cả";
        }
        else {
            boxTourInfo.classList.add("active");
            buttonReadMore.innerHTML = "Ẩn bớt";
        }
    })


    // ZOOM ẢNH
    new Viewer(boxTourInfo);
}

// END BOX TOUR INFO SECTION 10

// BOX TOUR SCHEDULE SECTION 10
const boxTourSchedule = document.querySelector(".section-10 .box-tour-schedule");
if (boxTourSchedule) {
    // ZOOM ẢNH
    new Viewer(boxTourSchedule);
}

// END BOX TOUR SECHEDULE SECTION 10


// KHỞI TẠO THƯ VIỆN AOS
AOS.init();
// END KHỞI TẠO THƯ VIỆN AOS


// SWRIPER SECTION 2
const swiperSection2 = document.querySelector(".swiperSection2");
if(swiperSection2) {
    new Swiper(".swiperSection2", {
      slidesPerView: 1,
      spaceBetween: 30,
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 3,
        },
      },
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
    });
}
// END SWIPER SECTION 2


// SWRIPER SECTION 3
const swiperSection3 = document.querySelector(".swiperSection3");
if(swiperSection2) {
    new Swiper(".swiperSection3", {
      slidesPerView: 1,
      spaceBetween: 20,
      breakpoints: {
        576: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
      },
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
}
// END SWIPER SECTION 3


// SWRIPER SECTION 2
const boxImage = document.querySelector(".box-image");
if(boxImage) {
    var swiperImageThumb = new Swiper(".swiperImageThumb", {
      loop: true,
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      breakpoints: {
        576: {
          spaceBetween: 10,
        },
      },
    });
    var swiperImageMain = new Swiper(".swiperImageMain", {
      loop: true,
      spaceBetween: 10,
      thumbs: {
        swiper: swiperImageThumb,
      },
    });

    // ZOOM ẢNH
    const innerImageMain = boxImage.querySelector(".inner-image-main");
    new Viewer(innerImageMain);
}
// END SWIPER SECTION 2


// EMAIL FORM
const emailForm = document.querySelector("#email-form");
if(emailForm) {
    const validator = new JustValidate('#email-form');

    validator
			.addField('#email-input', [
				{
					rule: "required",
					errorMessage: "Vui lòng nhập email của bạn"
				},
				{
					rule: "email",
					errorMessage: "Email không đúng định dạng!"
				}
			])
			.onSuccess((event) => {
				const email = event.target.email.value;

			});
}
// END EMAIL FORM


// COUPON FORM
const couponForm = document.querySelector("#coupon-form");
if(couponForm) {
    const validator = new JustValidate('#coupon-form');

    validator
			.addField('#coupon-input', [
				{
					rule: "required",
					errorMessage: "Vui lòng nhập mã giảm giá"
				}
			])
			.onSuccess((event) => {
				const email = event.target.coupon.value;

			});
}
// END COUPON FORM


// ORDER FORM
const orderForm = document.querySelector("#order-form");
if(orderForm) {
    const validator = new JustValidate('#order-form');

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
                const method = event.target.method.value;
			});
}
// END ORDER FORM


// LIST INPUT METHOD
const listInputMethod = orderForm.querySelectorAll(`input[name='method']`);
const elementInfoBank = orderForm.querySelector(".inner-info-bank");

listInputMethod.forEach(input => {
    input.addEventListener("change", () => {
        if(input.value == "bank") {
            elementInfoBank.classList.add("active");
        }
        else {
            elementInfoBank.classList.remove("active");
        }
    })
})

// END LIST INPUT METHOD