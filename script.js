const CANVAS_SIZE = 280;
const CANVAS_SCALE = 0.5;

var akkam = Math.floor(Math.random() * 10);
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const success = document.getElementById("success");
const clearButton = document.getElementById("clear-button");


var drawing = false;
var mousePos = { x:0, y:0 };
var lastPos = mousePos;

const audio = document.getElementById("music");
audio.src = 'sounds/' + akkam +'.ogg'
// Load our model.
const sess = new onnx.InferenceSession();
const loadingModelPromise = sess.loadModel("./onnx_model.onnx");

// Add 'Draw a number here!' to the canvas.
ctx.lineWidth = 28;
ctx.lineJoin = "round";
ctx.font = "28px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "#212121";
ctx.fillText("Draw a number here!", CANVAS_SIZE / 2, CANVAS_SIZE / 2);

// Set the line color for the canvas.
ctx.strokeStyle = "#212121";

function clearCanvas() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
}

function drawLine(fromX, fromY, toX, toY) {
  // Draws a line from (fromX, fromY) to (toX, toY).
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.closePath();
  ctx.stroke();
  lastPos = mousePos;
  updatePredictions();
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function updatePredictions() {
	
  // Get the predictions for the canvas data.
  const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const input = new onnx.Tensor(new Float32Array(imgData.data), "float32");

  await loadingModelPromise;
  const outputMap = await sess.run([input]);
  const outputTensor = outputMap.values().next().value;
  const predictions = outputTensor.data;
  const maxPrediction = Math.max(...predictions);
  
  

  

  for (let i = 0; i < predictions.length; i++) {
    const element = document.getElementById(`prediction-${i}`);
    element.children[0].children[0].style.height = `${predictions[i] * 100}%`;
    element.className =
      predictions[i] === maxPrediction
        ? "prediction-col top-prediction"
        : "prediction-col";
        if (predictions[i] === maxPrediction){
        if (i === akkam) { 
        	success.style.color = "green"
        	success.innerHTML = "Success"
        	await sleep(3000);
  			akkam = Math.floor(Math.random() * 10);
  			audio.src = 'sounds/' + akkam +'.ogg'
  			success.style.color = "blue"
  			success.innerHTML = "Listen"
			clearCanvas()

  		}
  		}
   

        
  }
}


canvas.addEventListener("mousedown", function (e) {
        drawing = true;        
  lastPos = getMousePos(canvas, e);
}, false);
canvas.addEventListener("mouseup", function (e) {
  drawing = false;
}, false);
canvas.addEventListener("mousemove", function (e) {
  mousePos = getMousePos(canvas, e); 
  if (drawing) {
  	drawLine(lastPos.x, lastPos.y,mousePos.x, mousePos.y); 
  }
}, false);


// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
  var rect = canvasDom.getBoundingClientRect();
  
  return {
    x: 2*(mouseEvent.clientX - rect.left),
    y: 2*(mouseEvent.clientY - rect.top)
  };
}

// Set up touch events for mobile, etc
canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: 2*(touchEvent.touches[0].clientX - rect.left),
    y: 2*(touchEvent.touches[0].clientY - rect.top)
  };
}



document.body.addEventListener("touchstart", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);
document.body.addEventListener("touchend", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);
document.body.addEventListener("touchmove", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);

clearButton.addEventListener("mousedown", clearCanvas);
