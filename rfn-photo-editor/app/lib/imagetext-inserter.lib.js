function ringImageTextInserter(angularScope, mainCanvasId, textCanvasId) {
    var mainCanvas,
        textCanvas,
        textCanvasNg,
        textCanvasRect,
        textCanvasContext,
        mouseClickHold,
        scope = angularScope;

    this.initTextOptions = initTextOptions;
    this.exit = exit;
    this.addtext = addText;
    this.clearAllText = clearAllText;
    scope.textHistory = [];

    function initTextOptions() {
        mainCanvas = document.getElementById(mainCanvasId);
        textCanvas = document.getElementById(textCanvasId);
        textCanvas.style.display = 'block';
        textCanvas.width = mainCanvas.width;
        textCanvas.height = mainCanvas.height;
        textCanvasRect = textCanvas.getBoundingClientRect();
        textCanvasContext = textCanvas.getContext('2d');
        mouseClickHold = false;
        textCanvasNg = angular.element(textCanvas);
        textCanvasNg.on('mouseup', mouseUpHandler);
        textCanvasNg.on('mousedown', mouseDownHandler);
        textCanvasNg.on('mousemove', mouseMoveHandler);
    }
    
    function exit() {
        textCanvas.style.display = 'none';
        textCanvasNg.off('mouseup', mouseUpHandler);
        textCanvasNg.off('mousedown', mouseDownHandler);
        textCanvasNg.off('mousemove', mouseMoveHandler);
    }
    
    function addText(text, font, color, size) {
        scope.noText = false;
        scope.textHistory.push({
            text: text,
            font: font,
            color: color,
            size: size,
            x: mainCanvas.width/3,
            y: mainCanvas.height/3,
        });
        drawAllTexts();
    }

    function clearTextCanvas() {
        textCanvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }

    function drawAllTexts() {
        var i,
            th;
        clearTextCanvas();
        for (i = 0; i < scope.textHistory.length; i++) {
            th = scope.textHistory[i];
            textCanvasContext.font = th.size+'px '+th.font;
            textCanvasContext.fillStyle = th.color;
            textCanvasContext.fillText(th.text, th.x, th.y);
            if (i === scope.textHistory.length - 1) {
                textCanvasContext.strokeRect(th.x, th.y, textCanvasContext.measureText(th.text).width, 1);
            }
        }
    }

    function clearAllText() {
        clearTextCanvas();
        scope.textHistory = [];
        scope.noText = true;
    }

    function mouseUpHandler() {
        mouseClickHold = false;
    }

    function mouseDownHandler(event) {
        mouseClickHold = true;
        mouseMoveHandler(event);
    }

    function mouseMoveHandler(event) {
        var lastTextObj;
        if (mouseClickHold && !scope.noText) {
            lastTextObj = scope.textHistory[scope.textHistory.length - 1];
            lastTextObj.x = event.offsetX;
            lastTextObj.y = event.offsetY;
            drawAllTexts();
        }
    }

    window.debugtext = function () {
        console.log(scope.textHistory);
    }
}