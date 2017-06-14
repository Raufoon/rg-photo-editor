function ringImageTextInserter(angularScope, mainCanvasId, textCanvasId) {
    var mainCanvas,
        textCanvas,
        textCanvasNg,
        textCanvasRect,
        textCanvasContext,
        mouseClickHold,
        selectedTextObj,
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
        textCanvasNg.on('mouseout', mouseOutHandler);
    }
    
    function exit() {
        textCanvas.style.display = 'none';
        textCanvasNg.off('mouseup', mouseUpHandler);
        textCanvasNg.off('mousedown', mouseDownHandler);
        textCanvasNg.off('mousemove', mouseMoveHandler);
        textCanvasNg.off('mouseout', mouseOutHandler);
    }
    
    function addText(text, font, color, size) {
        if (text.length === 0) {
            alert('Please add some text...');
            return;
        }
        scope.noText = false;
        scope.textHistory.push({
            text: text,
            font: font,
            color: color,
            size: size,
            x: 5,
            y: mainCanvas.height/2,
            textWidth: textCanvasContext.measureText(text).width,
        });
        drawAllTexts();
    }

    function clearTextCanvas() {
        textCanvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }

    function drawAllTexts() {
        var i,
            th,
            textWidth,
            failedInsertion;
        clearTextCanvas();
        for (i = 0; i < scope.textHistory.length; i++) {
            th = scope.textHistory[i];
            textCanvasContext.font = th.size+'px '+th.font;
            textCanvasContext.fillStyle = th.color;
            textWidth = textCanvasContext.measureText(th.text).width;
            if (textWidth > textCanvas.width) {
                scope.textHistory.pop();
                window.alert('Font size too large!!!');
                scope.noText = scope.textHistory.length === 0;
                return;
            }
            textCanvasContext.fillText(th.text, th.x, th.y);
            textCanvasContext.strokeRect(th.x, th.y - th.size, textWidth, th.size);
        }
    }

    function clearAllText() {
        clearTextCanvas();
        scope.textHistory = [];
        scope.noText = true;
    }

    function mouseUpHandler() {
        mouseClickHold = false;
        selectedTextObj = undefined;
    }

    var mouseHoldOffsetX,
        mouseHoldOffsetY;
    function mouseDownHandler(event) {
        var mouseX,
            mouseY;
        mouseClickHold = true;
        if (!scope.noText) {
            mouseX = getRelativeXFromEvent(event);
            mouseY = getRelativeYFromEvent(event);
            selectedTextObj = getSelectedTextObj(mouseX, mouseY);
            mouseHoldOffsetX = mouseX - selectedTextObj.x;
            mouseHoldOffsetY = selectedTextObj.y - mouseY;
            if (selectedTextObj) mouseMoveHandler(event);
        }
    }

    function mouseMoveHandler(event) {
        var mouseX,
            mouseY;
        if (mouseClickHold && !scope.noText && selectedTextObj) {
            mouseX = getRelativeXFromEvent(event);
            mouseY = getRelativeYFromEvent(event);
            if (!goesOverBoundary(selectedTextObj, mouseX - mouseHoldOffsetX, mouseY + mouseHoldOffsetY)) {
                selectedTextObj.x = mouseX - mouseHoldOffsetX;
                selectedTextObj.y = mouseY + mouseHoldOffsetY;
            };
            drawAllTexts();
        }
    }

    function getSelectedTextObj(x, y) {
        var i;
        for (i = 0; i < scope.textHistory.length; i++) {
            if (withinRange(scope.textHistory[i], x, y)) return scope.textHistory[i];
        }
        return undefined;
    }

    function goesOverBoundary(textObj, x, y) {
        var rx1 = x + textCanvasContext.measureText(textObj.text).width,
            ry0 = y - textObj.size;
        if (x < 0 || rx1 > mainCanvas.width) return true;
        if (ry0 < 0 || y > mainCanvas.height) return true;
        return false;
    }

    function withinRange(textObj, x, y) {
        var rx0 = textObj.x,
            ry0 = textObj.y - textObj.size,
            rx1 = textObj.x + textCanvasContext.measureText(textObj.text).width,
            ry1 = textObj.y;
        if (x >= rx0 && x <= rx1 && y >= ry0 && y<= ry1)
            return true;
        return false;
    }

    function getRelativeXFromEvent(event) {
        var rect = textCanvasNg[0].getBoundingClientRect();
        return Math.round((event.clientX - rect.left) / (rect.right - rect.left) * textCanvasNg[0].width);
    }

    function getRelativeYFromEvent(event) {
        var rect = textCanvasNg[0].getBoundingClientRect();
        return Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * textCanvasNg[0].height);
    }

    function mouseOutHandler() {
        mouseClickHold = false;
        selectedTextObj = undefined;
    }
}
angular.ringImageTextInserter = ringImageTextInserter;
