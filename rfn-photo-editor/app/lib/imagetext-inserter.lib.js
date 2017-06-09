function ringImageTextInserter(angularScope, mainCanvasId, textCanvasId) {
    var mainCanvas,
        camanJs,
        textCanvas,
        textCanvasNg,
        textCanvasRect,
        textCanvasContext,
        mouseClickHold,
        scope = angularScope;

    this.enter = enter;
    this.constructTextCanvas = constructTextCanvas;
    this.exit = exit;
    this.addtext = addText;
    this.clearAllText = clearAllText;
    scope.textHistory = [];

    function constructTextCanvas() {
        mainCanvas = document.getElementById(mainCanvasId);
        textCanvas = document.getElementById(textCanvasId);
        textCanvas.width = mainCanvas.width;
        textCanvas.height = mainCanvas.height;
        textCanvasRect = textCanvas.getBoundingClientRect();
        textCanvasContext = textCanvas.getContext('2d');
        camanJs = window.Caman(textCanvas);
    }

    function enter() {
        textCanvasNg = angular.element(textCanvas);
        textCanvasNg.on('mouseup', mouseUpHandler);
        textCanvasNg.on('mousedown', mouseDownHandler);
        textCanvasNg.on('mousemove', mouseMoveHandler);
    }
    
    function exit() {
        // textCanvas.style.display = 'none';
        textCanvasNg.off('mouseup', mouseUpHandler);
        textCanvasNg.off('mousedown', mouseDownHandler);
        textCanvasNg.off('mousemove', mouseMoveHandler);
    }
    
    function addText(text, font, color, size) {
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
        }
    }

    function clearAllText() {
        clearTextCanvas();
        scope.textHistory = [];
    }

    function getRelativeXFromEvent(event) {
        return Math.round((event.clientX - textCanvasRect.left) / (textCanvasRect.right - textCanvasRect.left) * textCanvas.width);
    }

    function getRelativeYFromEvent(event) {
        return Math.round((event.clientY - textCanvasRect.top) / (textCanvasRect.bottom - textCanvasRect.top) * textCanvas.height);
    }

    function mouseUpHandler() {
        mouseClickHold = false;
    }

    function mouseDownHandler() {
        mouseClickHold = true;
    }

    function mouseMoveHandler(event) {
        var lastTextObj;
        if (mouseClickHold) {
            lastTextObj = scope.textHistory[scope.textHistory.length - 1];
            lastTextObj.x = getRelativeXFromEvent(event);
            lastTextObj.y = getRelativeYFromEvent(event);
            drawAllTexts();
        }
    }
    
    function rotate() {
        
    }
}