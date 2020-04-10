const CANVAS_SIZE = 280;
const CANVAS_SCALE = 0.5;

var akkam = Math.floor(Math.random() * 10);
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const success = document.getElementById("success");
const clearButton = document.getElementById("clear-button");

success.style.color = "#afa1b5"
success.innerHTML = "..."

let mouseDown = 0;
let hasIntroText = true;
let lastX = 0;
let lastY = 0;
var touchX,touchY,mouseX,mouseY;

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
ctx.fillStyle = "#c9c9c9";
ctx.fillText("DRAW HERE!", CANVAS_SIZE / 2, CANVAS_SIZE / 2);

// Set the line color for the canvas.
ctx.strokeStyle = "#212121";

function clearCanvas() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  for (let i = 0; i < 10; i++) {
    const element = document.getElementById(`prediction-${i}`);
    element.className = "prediction-col";
    element.children[0].children[0].style.height = "0";
  }
}

function drawLine(fromX, fromY, toX, toY) {
  // Draws a line from (fromX, fromY) to (toX, toY).
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.closePath();
  ctx.stroke();
  
  //updatePredictions();
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
  var audioSuccess = new Audio('sounds/Applause.ogg');

  
  

  

  for (let i = 0; i < predictions.length; i++) {
    const element = document.getElementById(`prediction-${i}`);
    element.children[0].children[0].style.height = `${predictions[i] * 100}%`;
    element.className =
      predictions[i] === maxPrediction
        ? "prediction-col top-prediction"
        : "prediction-col";
        if (predictions[i] === maxPrediction){
        if (i === akkam) {
          if (maxPrediction > 0.5){ 
                  success.style.color = "green"
                  success.innerHTML = "GOOD!!!"
                  await sleep(300);
                  audioSuccess.play();
                  success.style.color = "#eedaf7"
                  await sleep(300);
                  success.style.color = "green"
                  await sleep(300);
                  success.style.color = "#eedaf7"
                  await sleep(300);
                  success.style.color = "green"
                  await sleep(300);
                  success.style.color = "#eedaf7"
                  await sleep(300);
                  success.style.color = "green"
                  await sleep(2000);
                akkam = Math.floor(Math.random() * 10);
                audio.src = 'sounds/' + akkam +'.ogg'
                success.style.color = "#afa1b5"
                success.innerHTML = "..."
                clearCanvas()
              }

  		}
  		}
   

        
  }
}

// Clear the canvas context using the canvas width and height
    function clearCanvas2() {
        ctx.clearRect(0, 0, 280, 280);
    }

    // Keep track of the mouse button being pressed and draw a dot at current location
    function sketchpad_mouseDown(e) {
        mouseDown=1;
        if (hasIntroText) {
        clearCanvas();
        hasIntroText = false;
        }
        getMousePos(e);
        lastX = mouseX
        lastY = mouseY
        // drawDot(ctx,mouseX,mouseY,28);

    }

    // Keep track of the mouse button being released
    function sketchpad_mouseUp() {
        mouseDown=0;
        updatePredictions();
    }

    // Keep track of the mouse position and draw a dot if mouse button is currently pressed
    function sketchpad_mouseMove(e) { 
        // Update the mouse co-ordinates when moved
        lastX = mouseX
        lastY = mouseY
        getMousePos(e);

        // Draw a dot if the mouse button is currently being pressed
        if (mouseDown==1) {
            drawLine(lastX,lastY,mouseX,mouseY,28);
        }
    }

    // Get the current mouse position relative to the top-left of the canvas
    function getMousePos(e) {
        if (!e)
            var e = event;

        if (e.offsetX) {
            mouseX = e.offsetX / CANVAS_SCALE;
            mouseY = e.offsetY / CANVAS_SCALE;
        }
        else if (e.layerX) {
            mouseX = e.layerX / CANVAS_SCALE;
            mouseY = e.layerY / CANVAS_SCALE;
        }
     }

    // Draw something when a touch start is detected
    function sketchpad_touchStart() {
        // Update the touch co-ordinates
        if (hasIntroText) {
        clearCanvas();
        hasIntroText = false;
        }
        getTouchPos();
        lastX = touchX
        lastY = touchY

        // drawDot(ctx,lastX,lastY,touchX,touchY,28);

        // Prevents an additional mousedown event being triggered
        event.preventDefault();
    }

    // Draw something and prevent the default scrolling when touch movement is detected
    function sketchpad_touchMove(e) { 
        lastX = touchX
        lastY = touchY
        // Update the touch co-ordinates
        getTouchPos(e);

        // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
        drawLine(lastX,lastY,touchX,touchY,28); 

        // Prevent a scrolling action as a result of this touchmove triggering.
        event.preventDefault();
    }

    // Get the touch position relative to the top-left of the canvas
    // When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
    // but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
    // "target.offsetTop" to get the correct values in relation to the top left of the canvas.
    function getTouchPos(e) {
        if (!e)
            var e = event;

        if(e.touches) {
            if (e.touches.length == 1) { // Only deal with one finger
                var touch = e.touches[0]; // Get the information for finger #1
                touchX=(touch.pageX-touch.target.offsetLeft) / CANVAS_SCALE;
                touchY=(touch.pageY-touch.target.offsetTop) / CANVAS_SCALE;
            }
        }
    }
    function sketchpad_touchEnd(e) { 
        updatePredictions();
    }


    // Set-up the canvas and add our event handlers after the page has loaded
    function init() {


        // Get the specific canvas element from the HTML document
        
        // const success = document.getElementById("success");
        // canvas = document.getElementById('sketchpad');
        // // audio.src = 'sounds/' + akkam + '.ogg';

        // // If the browser supports the canvas tag, get the 2d drawing context for this canvas
        // if (canvas.getContext)
        //     ctx = canvas.getContext('2d');
        //         ctx.lineWidth = 28;
        //         ctx.lineJoin = "round";
        //         ctx.font = "28px sans-serif";
        //         ctx.textAlign = "center";
        //         ctx.textBaseline = "middle";
        //         ctx.fillStyle = "#212121";
        //         ctx.fillText("Draw a number here!", 140,140);

        // Check that we have a valid context to draw on/with before adding event handlers
        // if (ctx) {
        //     // React to mouse events on the canvas, and mouseup on the entire document
        //     canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        //     canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        //     window.addEventListener('mouseup', sketchpad_mouseUp, false);

        //     // React to touch events on the canvas
        //     canvas.addEventListener('touchstart', sketchpad_touchStart, false);
        //     canvas.addEventListener('touchmove', sketchpad_touchMove, false);
        // }
    }
    if (ctx) {
            // React to mouse events on the canvas, and mouseup on the entire document
            canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
            canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
            window.addEventListener('mouseup', sketchpad_mouseUp, false);

            // React to touch events on the canvas
            canvas.addEventListener('touchstart', sketchpad_touchStart, false);
            canvas.addEventListener('touchmove', sketchpad_touchMove, false);
            window.addEventListener('touchend', sketchpad_touchEnd, false);

            clearButton.addEventListener("mousedown", clearCanvas);
        }