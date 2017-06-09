function ringImageTextInserter(angularScope, mainCanvasId, textCanvasId) {
    var mainCanvas,
        textCanvas,
        textCanvasNg,
        textCanvasRect,
        textCanvasContext,
        currentText = '',
        fontStyle,
        fontSize,
        fontColor,
        mouseClickHold,
        scope = angularScope;

    this.init = init;
    this.exit = exit;
    this.addtext = addText;

    function init() {
        mainCanvas = document.getElementById(mainCanvasId);
        textCanvas = document.getElementById(textCanvasId);
        textCanvas.style.display = 'block';
        textCanvas.width = mainCanvas.width;
        textCanvas.height = mainCanvas.height;
        textCanvasRect = textCanvas.getBoundingClientRect();
        textCanvasContext = textCanvas.getContext('2d');

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
        currentText = text;
        fontStyle = font;
        fontColor = color;
        fontSize = size;
        textCanvasContext.font = size+'px '+font;
        textCanvasContext.fillStyle = color;
        drawText(mainCanvas.width/3, mainCanvas.height/3);
    }

    function drawText(x, y) {
        textCanvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        textCanvasContext.fillText(currentText, x, y);
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
        if (mouseClickHold) {
            drawText(
                getRelativeXFromEvent(event),
                getRelativeYFromEvent(event)
            );
        }
    }
}