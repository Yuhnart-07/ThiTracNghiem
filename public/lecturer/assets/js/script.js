/* =====================================================
   SECTION 4 - EXAM SIMULATOR
   JAVASCRIPT CONTROLLER
===================================================== */


const QUESTIONS = [

	{
		id: 12,

		text:
		"According to the 'Kinetic Ledger' design philosophy, how should structural boundaries be established between high-density data grids and navigation elements?",


		options: [

			{
				label: "A",
				text:
				"By using 1px solid black borders (#000000) to ensure high-contrast separation."
			},


			{
				label: "B",
				text:
				"Through intentional tonal shifts and layering of different surface containers, avoiding traditional strokes."
			},


			{
				label: "C",
				text:
				"Using drop shadows with high opacity and 0px blur for maximum hardness."
			}

		],


		correctOption: "B"

	}

];





let currentQuestionId = 12;



let answers = {

	1: "A",
	2: "C",
	3: "A",
	4: "B",
	5: "C",
	6: "A",
	7: "B",
	8: "C",
	9: "A",
	10: "B",
	11: "A"

};



let flagged = {

	4:true

};



let timeLeft = 2700;





/* =====================================================
   TIMER
===================================================== */


const countdownInterval = setInterval(()=>{


	if(timeLeft <= 0){

		clearInterval(countdownInterval);

		autoSubmit();

		return;

	}



	timeLeft--;

	updateTimerUI();



},1000);






function updateTimerUI(){


	const h =
	Math.floor(timeLeft / 3600)
	.toString()
	.padStart(2,"0");



	const m =
	Math.floor((timeLeft % 3600) / 60)
	.toString()
	.padStart(2,"0");



	const s =
	(timeLeft % 60)
	.toString()
	.padStart(2,"0");



	const timer =
	document.getElementById("countdown");



	if(timer){

		timer.textContent =
		`${h}:${m}:${s}`;

	}

}





/* =====================================================
   QUESTION PALETTE
===================================================== */


function renderQuestionPalette(){


	const grid =
	document.getElementById("palette-grid");



	if(!grid) return;



	grid.innerHTML = "";



	for(let i = 1; i <= 40; i++){


		const button =
		document.createElement("button");



		button.textContent = i;



		if(i === currentQuestionId){


			button.classList.add(
				"active"
			);



		}
		else if(flagged[i]){


			button.classList.add(
				"flagged"
			);


		}
		else if(answers[i]){


			button.classList.add(
				"done"
			);


		}



		button.addEventListener(
			"click",
			()=>selectQuestion(i)
		);



		grid.appendChild(button);


	}


}







function selectQuestion(id){


	currentQuestionId = id;


	renderQuestionPalette();


	loadQuestion(id);


}






/* =====================================================
   LOAD QUESTION
===================================================== */


function loadQuestion(id){


	const question =
	QUESTIONS.find(
		item=>item.id === id
	);



	if(!question)
	return;



	const title =
	document.getElementById(
		"question-text"
	);



	if(title){

		title.textContent =
		question.text;

	}




	const answerBox =
	document.getElementById(
		"options-container"
	);



	if(answerBox){


		answerBox.innerHTML = "";



		question.options.forEach(option=>{


			const item =
			document.createElement(
				"div"
			);



			item.className =
			"answer-item";



			item.innerHTML = `

				<label>

					<input
						type="radio"
						name="answer"
						value="${option.label}"
					>

					<span>
						${option.label}.
						${option.text}
					</span>

				</label>

			`;



			answerBox.appendChild(item);



		});


	}



}







/* =====================================================
   AUTO SUBMIT
===================================================== */


function autoSubmit(){


	alert(
		"Hết giờ làm bài! Hệ thống đang nộp bài kiểm tra tự động."
	);



}





/* =====================================================
   SUBMIT BUTTON
===================================================== */


function submitExam(){


	const confirmSubmit =
	confirm(
		"Bạn có chắc muốn nộp bài?"
	);



	if(confirmSubmit){


		console.log(
			"Exam submitted"
		);


	}



}






/* =====================================================
   INIT
===================================================== */


document.addEventListener(
	"DOMContentLoaded",
	()=>{


		renderQuestionPalette();


		updateTimerUI();



		const submitTop =
		document.getElementById(
			"btn-submit-top"
		);



		const submitMain =
		document.getElementById(
			"btn-submit-main"
		);



		if(submitTop){

			submitTop.addEventListener(
				"click",
				submitExam
			);

		}



		if(submitMain){

			submitMain.addEventListener(
				"click",
				submitExam
			);

		}



		loadQuestion(
			currentQuestionId
		);



	}

);


(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const initMobileMenu = () => {
    const buttonMenu = qs(".header .inner-button-menu");
    const sider = qs(".sider");
    const main = qs(".main");
    const iconMenu = qs(".inner-button-menu i");

    if (!buttonMenu || !sider) return;

    buttonMenu.addEventListener("click", () => {
        sider.classList.toggle("active");
        main.classList.toggle("active");

        iconMenu.classList.toggle("fa-indent");
        iconMenu.classList.toggle("fa-outdent");
    });
  };

  const initActiveSiderLink = () => {
    const sider = qs(".sider");
    if (!sider) return;

    const currentParts = window.location.pathname.split("/");

    qsa("a[href]", sider).forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;

      const linkParts = href.split("/");
      if (currentParts[1] === linkParts[1] && currentParts[2] === linkParts[2]) {
        link.classList.add("inner-active");
      }
    });
  };

  const initTextEditors = () => {
    if (typeof tinymce === "undefined") return;

    const textareas = qsa("[textarea-mce]");
    if (textareas.length === 0) return;

    tinymce.init({
      selector: "[textarea-mce]",
      plugins: ["anchor", "link", "charmap", "lists"],
      toolbar: "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link anchor charmap | numlist bullist",
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveSiderLink();
    initTextEditors();
  });
})();
