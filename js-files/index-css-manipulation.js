(() => {
	var pText = document.getElementsByClassName('p-text')[0]
	
	// ARROW Related
	var arrowCont = document.getElementById('arrow-bg')	
	var arrowSvg = document.getElementById('arrow-svg')
	var arrow = arrowSvg.getElementById("arrow")

	var valMove = 0, tapY = 0, decrease = 0, increase = 0
	var arrowHeight = arrowSvg.clientHeight;
	var speed = 5;

	// PEDAL Related
	var pText = document.getElementsByClassName('p-text')[0]
	var pedal = document.getElementsByClassName('pedal')[0]

	const bc = 100 - pedal.clientWidth;		// Bulhar
	const initRot = -20;

	// Pedal Rotation is set onto 20 degrees -> 
	// 		that corresponds with arrow movement - which is 40px 
	// 			(is easily divisible by 20)


	// Only setting the text indicator text
	const setVal = (valMove) => {
		pText.innerText = (Math.floor(valMove*2.5)+"%")
		pText.style.color = `rgba(255,0,0,${0.2 + (valMove/50)})`
	}

	
	/// ARROW Related
	
	const releaseArrow = () => {
		if(valMove>0) {
			valMove -= 1
			setVal(valMove)
			decrease = setTimeout(() => releaseArrow(), speed)
		}
	}

	const moveArrow = (valMove) => {
		arrow.style.fill = `rgba(255,0,0,${0.2 + (valMove/50)})`	
		arrowSvg.style.transform=`translate(0, ${valMove}px)`

		rotate(valMove/2)
		setVal(valMove)
	}
	

	// Actions for mouse over ARROW
	
	arrowCont.onmousemove = (e) => {
		// console.log("I am in");

		// Set the tap Y if not set (coming from outside or bottom)
		if(tapY==0 && e.offsetY<arrowHeight+1) tapY = e.offsetY
		
		// If tap Y is set - try to move the arrow
		if(tapY>0) {
			valMove = (e.offsetY - tapY)

			console.log(`origY:${tapY}, offsetY:${e.offsetY}, arrowHeight:${arrowCont.clientHeight}`)

			if((arrowHeight-tapY+e.offsetY) > arrowCont.clientHeight) {
				valMove = (arrowCont.clientHeight - arrowHeight)
				tapY = e.offsetY - (arrowCont.clientHeight-arrowHeight)
			}

			// This does not allow the arrow to move up beyond container
			if(valMove<0) { valMove=0; tapY = e.offsetY }

			if(tapY<=arrowHeight) moveArrow(valMove)
		}
		else {
			arrow.style.fill = 'none'
		}
	}

	arrowCont.addEventListener("mouseleave", () => {
		tapY = 0; rotate(0)
		arrow.style.fill = 'none'
		arrowSvg.style.transform = ""
		decrease = setTimeout(() => releaseArrow(), speed)
	});

	

	/// PEDAL related
	
	function rotate(deg) {
		pText.innerText = (deg*5+"%")
		pedal.style.transform = `rotate(${deg+initRot}deg)`;
	}

	// Actions for mouse over PEDAL

	pedal.addEventListener("mousemove", (e) => {
		// pText.style.color = "red"

		val = Math.floor((((pedal.clientWidth + bc - e.offsetX) / pedal.clientWidth) * 100) / 3)+ initRot
		if(val>20) val=20; if(val<0) val = 0;

		moveArrow(val*2)
	});
	
	pedal.addEventListener("mouseleave", () => {
		// pText.style.color = "green"
		moveArrow(0)
	});

}) ()