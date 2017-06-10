function ringImageCropper(angularScope, mainCanvasId, offscreenCanvasId) {
    var offScreenCanvas,
        isHoldForCrop,
        offScreenCanvasRect,
        cropX0,
        cropY0,
        cropX1,
        cropY1,
        scope = angularScope;

    this.initCropSection = initCropSection;
    this.exitCropSection = exitCropSection;
    this.initOffSrcCanvas = initOffSrcCanvas;
    this.clearOffSrcCanvas = clearOffSrcCanvas;
    this.setCropSelected = setCropSelected;
    this.getCropParam = getCropParam;

    function initCropSection() {
        var offScreenCanvasContext;

        offScreenCanvas = angular.element(document.getElementById(offscreenCanvasId));
        offScreenCanvas.on('mouseup', mouseUpOnCanvas);
        offScreenCanvas.on('mousedown', mouseDownOnCanvas);
        offScreenCanvas.on('mousemove', mouseMoveOnCanvas);

        initOffSrcCanvas();

        offScreenCanvasContext = offScreenCanvas[0].getContext('2d');
        offScreenCanvasContext.strokeStyle = "#ffcb85";
        offScreenCanvasContext.lineWidth=5;

        clearOffSrcCanvas();
        setCropSelected(false);
    }

    function setCropSelected(flag) {
        scope.crSel = flag;
    }

    function exitCropSection() {
        isHoldForCrop = false;
        clearOffSrcCanvas();
        offScreenCanvas.off('mouseup', mouseUpOnCanvas);
        offScreenCanvas.off('mousedown', mouseDownOnCanvas);
        offScreenCanvas.off('mousemove', mouseMoveOnCanvas);
        offScreenCanvas[0].style.display = 'none';
        setCropSelected(false);
    }

    function initOffSrcCanvas() {
        var mainCanvas = angular.element(document.getElementById(mainCanvasId))[0];
        offScreenCanvas = angular.element(document.getElementById(offscreenCanvasId));
        offScreenCanvas[0].style.display = 'block';
        offScreenCanvas[0].height = mainCanvas.height;
        offScreenCanvas[0].width = mainCanvas.width;
        // offScreenCanvas[0].style.maxHeight = '100%';
        // offScreenCanvas[0].style.maxWidth = '100%';
        offScreenCanvasRect = offScreenCanvas[0].getBoundingClientRect();
    }

    function clearOffSrcCanvas() {
        var offScreenCanvasContext = offScreenCanvas[0].getContext('2d');
        offScreenCanvasContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        offScreenCanvasContext.clearRect(0, 0, offScreenCanvas[0].width, offScreenCanvas[0].height);
        offScreenCanvasContext.fillRect(0, 0, offScreenCanvas[0].width, offScreenCanvas[0].height);
    }

    function drawRectangleOnCropCanvas(startX, startY, endX, endY) {
        var x0 = Math.min(startX, endX),
            y0 = Math.min(startY, endY),
            wid = Math.abs(startX - endX),
            hei = Math.abs(startY - endY),
            offScreenCanvasContext = offScreenCanvas[0].getContext('2d');
        offScreenCanvasContext.strokeRect(x0, y0, wid, hei);
        offScreenCanvasContext.clearRect(x0, y0, wid, hei);
    }

    function getRelativeXFromEvent(event) {
        return Math.round((event.clientX - offScreenCanvasRect.left) / (offScreenCanvasRect.right - offScreenCanvasRect.left) * offScreenCanvas[0].width);
    }

    function getRelativeYFromEvent(event) {
        return Math.round((event.clientY - offScreenCanvasRect.top) / (offScreenCanvasRect.bottom - offScreenCanvasRect.top) * offScreenCanvas[0].height);
    }

    function mouseDownOnCanvas(event) {
        if (isHoldForCrop) return;
        setCropSelected(false);
        // scope.$digest();
        isHoldForCrop = true;
        initOffSrcCanvas();
        clearOffSrcCanvas();
        cropX0 = cropX1 = getRelativeXFromEvent(event);
        cropY0 = cropY1 = getRelativeYFromEvent(event);
    }

    function mouseUpOnCanvas() {
        isHoldForCrop = false;
        if (Math.abs(cropX0-cropX1) < 20 && Math.abs(cropY0-cropY1) < 20) {
            setCropSelected(false);
            clearOffSrcCanvas();
        }
        else setCropSelected(true);
        scope.$digest();
    }

    function mouseMoveOnCanvas(event) {
        if (isHoldForCrop) {
            cropX1 = getRelativeXFromEvent(event);
            cropY1 = getRelativeYFromEvent(event);
            clearOffSrcCanvas();
            drawRectangleOnCropCanvas(cropX0, cropY0, cropX1, cropY1);
        }
    }

    function getCropParam() {
        var cX = Math.min(cropX0, cropX1),
            cY = Math.min(cropY0, cropY1),
            cW = Math.abs(cropX0 - cropX1),
            cH = Math.abs(cropY0 - cropY1);
        return {
            cropWidth: cW,
            cropHeight: cH,
            cropX0: cX,
            cropY0: cY,
        }
    }
}