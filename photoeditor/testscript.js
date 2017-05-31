var mainimg = document.getElementById('mainimg');

var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d');

function drawImage(imageObj) {
    var imageX = 0;
    var imageY = 0;
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    ctx.drawImage(imageObj, imageX, imageY);
}
var imageObj = new Image();
imageObj.onload = function () {
    drawImage(this);
    mainimg.setAttribute("style", "width:" + canvas.width + "px; height:" + canvas.height + "px");
};
imageObj.src = 'image/download.png';

var cropimg = document.getElementById('crop');
var cropSection = document.getElementById('cropSection');
var cropSavebtn = document.getElementById('cropsavebtn');
var cropCanclebtn = document.getElementById('cropcanclebtn');

var cropX = document.getElementById('cropX'),
        cropY = document.getElementById('cropY'),
        cropWidth = document.getElementById('cropWidth'),
        cropHeight = document.getElementById('cropHeight');
//var dID;
function disableBtn(dID) {
    dID.setAttribute('disabled', true);
    dID.classList.add("disabled");
}

function undisableBtn(dID) {
    dID.removeAttribute('disabled');
    dID.classList.remove("disabled");
}

cropimg.addEventListener("click", function () {
    canvas2.style.display = "block";
    cropSection.style.display = "block";
    disableBtn(cropSavebtn);

    resizeSection.style.display = "none";
    rotateSection.style.display = "none";
    textSection.style.display = "none";

    rect.startX = rect.startY = rect.w = rect.h = undefined;
    drawCanvas();
    if (rect.w === undefined) {
        cropX.value = 0;
        cropY.value = 0;
        cropWidth.value = 0;
        cropHeight.value = 0;
    }
});



var canvas2 = document.getElementById('canvas2'),
        ctx2 = canvas2.getContext('2d'),
        rect = {},
        drag = false,
        mouseX, mouseY,
        closeEnough = 7,
        resize = 0, dragged = 0, exp = 0,
        rStartX, rStartY, rEndX, rEndY,
        inRectX, inRectY,
        dragTL = dragBL = dragTR = dragBR = false;

var cWidth = 0, cHeight = 0;
//var width, height;



function drawCanvas() {
    if (cWidth === 0 && cHeight === 0) {
        canvas2.width = canvas.width;
        canvas2.height = canvas.height;
    } else {
        canvas2.width = cWidth;
        canvas2.height = cHeight;
    }
    ctx2.fillStyle = 'rgba(0, 0, 0, .7)';
    ctx2.strokeStyle = "#666666";
    ctx2.strokeRect(0, 0, canvas2.width, canvas2.height);
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
}

function init() {

//    canvas2.addEventListener('mouseover', mouseOver, false);
    canvas2.addEventListener('mousedown', mouseDown, false);
    canvas2.addEventListener('mouseup', mouseUp, false);
    canvas2.addEventListener('mousemove', mouseMove, false);
//    canvas2.addEventListener('mouseout', mouseOut, false);

    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('mouseout', handleMouseOut, false);
}







function mouseDown(e) {
    mouseX = e.pageX - (this.parentNode.offsetLeft + this.offsetLeft);
    mouseY = e.pageY - (this.parentNode.offsetTop + this.offsetTop);

    if (rect.w === undefined) {
        rect.startX = mouseX;
        rect.startY = mouseY;
        dragBR = true;
        canvas2.style.cursor = "nw-resize";
    }
    // 1. top left
    else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY)) {
        dragTL = true;
        canvas2.style.cursor = "nw-resize";
    }
    // 2. top right
    else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY)) {
        dragTR = true;
        canvas2.style.cursor = "ne-resize";
    }
    // 3. bottom left
    else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
        dragBL = true;
        canvas2.style.cursor = "ne-resize";
    }
    // 4. bottom right
    else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
        dragBR = true;
        canvas2.style.cursor = "nw-resize";
    }

    if (dragTL || dragTR || dragBL || dragBR === true) {
        resize = 1;
        exp = 0;
    } else {
        resize = 0;
        canvas2.style.cursor = "crosshair";
        if (mouseDown) {
            exp = 2;
        }
    }
    if ((mouseX > rect.startX) && (mouseX < rect.startX + rect.w) && (mouseY > rect.startY) && (mouseY < rect.startY + rect.h) && resize === 0) {
        canvas2.style.cursor = "move";
        inRectX = mouseX - rect.startX;
        inRectY = mouseY - rect.startY;
        if (mouseDown && mouseMove) {
            canvas2.style.cursor = "move";
            exp = 1;
            drag = true;
        } else {
            exp = 0;
        }
    }
    if (dragged === 1 && exp === 2) {
        rect.startX = mouseX;
        rect.startY = mouseY;
        dragBR = true;
    }
}

function checkCloseEnough(p1, p2) {
    return Math.abs(p1 - p2) < closeEnough;
}

function mouseUp() {
    canvas2.style.cursor = "crosshair";
    dragTL = dragTR = dragBL = dragBR = drag = false;
    if (exp !== 2) {
        exp = 0;
    }
}

function mouseMove(e) {
    if ((exp === 0 || exp === 2) && dragTL || dragTR || dragBL || dragBR || drag) {
        mouseX = e.pageX - (this.parentNode.offsetLeft + this.offsetLeft);
        mouseY = e.pageY - (this.parentNode.offsetTop + this.offsetTop);

        if (dragTL) {
            rect.w += rect.startX - mouseX;
            rect.h += rect.startY - mouseY;
            rect.startX = mouseX;
            rect.startY = mouseY;
        } else if (dragTR) {
            rect.w = Math.abs(rect.startX - mouseX);
            rect.h += rect.startY - mouseY;
            rect.startY = mouseY;
        } else if (dragBL) {
            rect.w += rect.startX - mouseX;
            rect.h = Math.abs(rect.startY - mouseY);
            rect.startX = mouseX;
        } else if (dragBR) {
            rect.w = Math.abs(rect.startX - mouseX);
            rect.h = Math.abs(rect.startY - mouseY);
        }
        draw();
        dragged = 1;
    }

    if (exp === 1) {
        rStartX = rect.startX - inRectX;
        rStartY = rect.startY - inRectY;
        rEndX = (rStartX + rect.w);
        rEndY = (rStartY + rect.h);
        mouseX = e.pageX - (this.parentNode.offsetLeft + this.offsetLeft);
        mouseY = e.pageY - (this.parentNode.offsetTop + this.offsetTop);
        rect.startX = mouseX - inRectX;
        rect.startY = mouseY - inRectY;
        draw();
    }
    if (rect.w === undefined) {
        disableBtn(cropSavebtn);
    } else {
        undisableBtn(cropSavebtn);
    }
}

function draw() {
    if (rect.startX > -500 && rect.startY > -500 && (rect.startX + rect.w) < canvas2.width + 500 && (rect.startY + rect.h) < canvas2.height + 500) {
        if (rect.startX < 0) {
            rect.startX = 0;
        }
        if (rect.startY < 0) {
            rect.startY = 0;
        }
        if ((rect.startX + rect.w) > canvas2.width) {
            rect.startX = canvas2.width - rect.w;
        }
        if ((rect.startY + rect.h) > canvas2.height) {
            rect.startY = canvas2.height - rect.h;
        }
        cropX.value = rect.startX;
        cropY.value = rect.startY;
        cropWidth.value = rect.w;
        cropHeight.value = rect.h;

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        drawCanvas();

        ctx2.clearRect(rect.startX, rect.startY, rect.w, rect.h);
        ctx2.strokeStyle = "#ffffff";
        ctx2.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
        ctx2.rect(rect.startX, rect.startY, rect.w, rect.h);
        drawHandles();
    }
}

function drawCircle(x, y, radius) {
    ctx2.fillStyle = "#ffffff";
    ctx2.beginPath();
    ctx2.arc(x, y, radius, 0, 2 * Math.PI);
    ctx2.fill();
}

function drawHandles() {
    drawCircle(rect.startX, rect.startY, closeEnough);
    drawCircle(rect.startX + rect.w, rect.startY, closeEnough);
    drawCircle(rect.startX + rect.w, rect.startY + rect.h, closeEnough);
    drawCircle(rect.startX, rect.startY + rect.h, closeEnough);
}




//  ************************************** APPLY ADJUSTMENT  ***********************************************  //

document.addEventListener('DOMContentLoaded', function () {
    var listInput = document.querySelectorAll('input[type="range"]');
    for (var i = 0; i < listInput.length; i++) {
        listInput[i].onchange = applyFilters;
    }
}, false);

function applyFilters() {
    var brtns = document.getElementById('brightness').value;
    var h = document.getElementById('hue').value;
    var strn = document.getElementById('saturation').value;
    var cntrst = document.getElementById('contrast').value;
    var vibr = document.getElementById('vibrance').value;
    var sep = document.getElementById('sepia').value;
    var srpn = document.getElementById('sharpen').value;
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.brightness(brtns).hue(h).saturation(strn).contrast(cntrst).vibrance(vibr).sepia(sep).sharpen(srpn).render();
    });
}

// ************************ CROP SECTION ************************** //
cropSavebtn.addEventListener("click", function () {
    if (rect.startX < 0) {
        rect.startX = 0;
    }
    if (rect.startY < 0) {
        rect.startY = 0;
    }
    if ((rect.startX + rect.w) > canvas2.width) {
        rect.startX = canvas2.width - rect.w;
    }
    if ((rect.startY + rect.h) > canvas2.height) {
        rect.startY = canvas2.height - rect.h;
    }
    Caman("#canvas", imageObj, function () {
        // width, height, x, y
        this.crop(rect.w, rect.h, rect.startX, rect.startY);
        this.render();
    });

    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    cWidth = rect.w, cHeight = rect.h;
    mainimg.setAttribute("style", "width:" + cWidth + "px; height:" + cHeight + "px");
    canvas2.style.display = "none";
    disableBtn(cropSavebtn);
//    ctx.save();
//    texts = [];
});

cropCanclebtn.addEventListener("click", function () {
    rect.startX = rect.startY = rect.w = rect.h = undefined;
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    canvas2.style.display = "none";
    cropSection.style.display = "none";
});


// ************************ RESIZE SECTION ************************** //
var resize = document.getElementById('resize'),
        resizeSavebtn = document.getElementById('resizesavebtn'),
        resizeCanclebtn = document.getElementById('resizecanclebtn'),
        resizeWidth = document.getElementById('resizeWidth'),
        resizeHeight = document.getElementById('resizeHeight');

resize.addEventListener("click", function () {
    disableBtn(resizeSavebtn);
    cropSection.style.display = "none";
    canvas2.style.display = "none";
    resizeSection.style.display = "block";
    rotateSection.style.display = "none";
    textSection.style.display = "none";
});


document.addEventListener('DOMContentLoaded', function () {
    var rInput = document.querySelectorAll('.rinput');
    for (var i = 0; i < rInput.length; i++) {
        rInput[i].onchange = resizeValues;
    }
}, false);
function resizeValues() {
    var rW = resizeWidth.value;
    var rH = resizeHeight.value;
    if (rW && rH > 0) {
        undisableBtn(resizeSavebtn);
    } else {
        disableBtn(resizeSavebtn);
    }
}

resizeSavebtn.addEventListener("click", function () {
    Caman("#canvas", imageObj, function () {
        this.resize({
            width: resizeWidth.value,
            height: resizeHeight.value
        });
        this.render();
    });
    mainimg.setAttribute("style", "width:" + resizeWidth.value + "px; height:" + resizeHeight.value + "px");
    cWidth = resizeWidth.value;
    cHeight = resizeHeight.value;
});

resizeCanclebtn.addEventListener("click", function () {
    resizeSection.style.display = "none";
});

// ***************************ROTATE **************************  //
var rotate = document.getElementById('rotate'),
        rotateSection = document.getElementById('rotateSection'),
        rotatecw = document.getElementById('rotate-cw'),
        rotateccw = document.getElementById('rotate-ccw');
var rv = 0;
var rotation = 0;
rotate.addEventListener("click", function () {
    cropSection.style.display = "none";
    canvas2.style.display = "none";
    resizeSection.style.display = "none";
    rotateSection.style.display = "block";
    textSection.style.display = "none";
});

rotatecw.addEventListener("click", function () {
    rotation += 90;
    rotationWidthHeight(rotation);
    Caman("#canvas", imageObj, function () {
        this.rotate(90);
        this.render();
    });
});
rotateccw.addEventListener("click", function () {
    rotation -= 90;
    rotationWidthHeight(rotation);
    Caman("#canvas", imageObj, function () {
        this.rotate(-90);
        this.render();
    });

});
function rotationWidthHeight(rotation) {
    if (cWidth === 0 && cHeight === 0) {
        cWidth = canvas.width;
        cHeight = canvas.height;
    }
    var swapWidth = cWidth;
    var swapHeight = cHeight;
    if (rotation === 360 || rotation === -360) {
        rotation = 0;
    }
    if (rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270) {
        cWidth = swapHeight;
        cHeight = swapWidth;
        rv = 1;
        mainimg.setAttribute("style", "width:" + cWidth + "px; height:" + cHeight + "px");
    } else {
        cWidth = swapHeight;
        cHeight = swapWidth;
        rv = 1;
        mainimg.setAttribute("style", "width:" + cWidth + "px; height:" + cHeight + "px");
    }


}


// ******************************  TEXT SECTION ******************************** //
var text = document.getElementById('text'),
        textSection = document.getElementById('textSection');


text.addEventListener("click", function () {
    canvas.removeAttribute('data-caman-id');
    Caman("#canvas", imageObj, function () {
        this.reloadCanvasData();
        this.render();
    });
    cropSection.style.display = "none";
    canvas2.style.display = "none";
    resizeSection.style.display = "none";
    rotateSection.style.display = "none";
    textSection.style.display = "block";
});

//document.addEventListener('DOMContentLoaded', function () {
//    document.querySelector('#textVal').onchange = canvasText;
//    document.querySelector('#fontFamily').onchange = canvasText;
//    document.querySelector('#fontSize').onchange = canvasText;
//    document.querySelector('#textColor').onchange = canvasText;
//}, false);



//function canvasFontSize() {
//    console.log(fontSize.value);
//    ctx.font = fontSize.value + "px";
//}
//function canvasFontFamily() {
//    console.log(fontFamily.value);
//    ctx.font = fontSize.value + "px " + fontFamily.value;
//}
//function canvasTextColor() {
//    console.log(textColor.value);
//    ctx.fillStyle = textColor.value;
//}
//
//function canvasTextValue() {
//    console.log(textVal.value);
//    ctx.fillText(textVal.value, 150, 100);
//}
//
//
//function canvasText() {
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
//    drawImage(imageObj);
//    ctx.font = fontSize.value + "px " + fontFamily.value;
//    ctx.fillStyle = textColor.value;
//    ctx.fillText(textVal.value, canvas.width / 3, canvas.height / 2);
//}
//
//applyText.addEventListener("click", function () {
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
//    drawImage(imageObj);
//    ctx.font = fontSize.value + "px " + fontFamily.value;
//    ctx.fillStyle = textColor.value;
//    ctx.fillText(textVal.value, 150, 100);
//});



var textstartX;
var textstartY;
var texts = [];
var selectedText = -1;


function textHittest(x, y, textIndex) {
    var text = texts[textIndex];
    return (x >= text.x && x <= text.x + text.width && y >= text.y - text.height && y <= text.y);
}

function handleMouseDown(e) {
//    e.preventDefault();
    textstartX = parseInt(e.pageX - (this.parentNode.offsetLeft + this.offsetLeft));
    textstartY = parseInt(e.pageY - (this.parentNode.offsetTop + this.offsetTop));
    for (var i = 0; i < texts.length; i++) {
        if (textHittest(textstartX, textstartY, i)) {
            selectedText = i;
            console.log("selectedText: " + selectedText);
        }
    }
}

function handleMouseUp(e) {
    e.preventDefault();
    selectedText = -1;
}

function handleMouseOut(e) {
    e.preventDefault();
    selectedText = -1;
}


function handleMouseMove(e) {
    if (selectedText < 0) {
        return;
    }
//    e.preventDefault();
    tmX = parseInt(e.pageX - (this.parentNode.offsetLeft + this.offsetLeft));
    tmY = parseInt(e.pageY - (this.parentNode.offsetTop + this.offsetTop));

    var dx = tmX - textstartX;
    var dy = tmY - textstartY;
    textstartX = tmX;
    textstartY = tmY;

    var text = texts[selectedText];
    text.x += dx;
    text.y += dy;
    drawText();
}


var applyText = document.getElementById('applyText');
applyText.addEventListener("click", function () {
    var textVal = document.getElementById('textVal').value;
    var fontSize = document.getElementById('fontSize').value;
    var fontFamily = document.getElementById('fontFamily').value;
    var textColor = document.getElementById('textColor').value;

    var y = texts.length * (Number(fontSize) + 20) + 100;
    var text = {
        text: textVal,
        x: 0,
        y: y,
        fs: Number(fontSize),
        ff: fontFamily,
        fc: textColor
    };
    ctx.font = text.fs + "px " + fontFamily;
    text.width = ctx.measureText(text.text).width;
    text.height = text.fs;
    text.x = (canvas.width - text.width) / 2;
    texts.push(text);
    console.log(texts);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(imageObj);
    drawText();
});



function drawText() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(imageObj);
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        ctx.font = text.fs + "px " + text.ff;
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = text.fc;
        if (text.x > -200 && text.y > -200 && (text.x + text.width) < canvas.width + 200 && (text.y + text.height) < canvas.height + 200) {
            if (text.x < 10) {
                text.x = 10;
            }
            if (text.y < text.fs + 10) {
                text.y = text.fs + 10;
            }
            if ((text.x + text.width) > canvas.width - 10) {
                text.x = (canvas.width - text.width) - 10;
            }
            if ((text.y + text.height) - 30 > canvas.height) {
                text.y = (canvas.height - text.height) + 30;
            }
            console.log("text x, y : " + i, text.x, text.y);
            ctx.fillText(text.text, text.x, text.y);
            if (i === selectedText) {
                ctx.strokeStyle = "#ffffff";
                ctx.strokeRect((text.x - 10), (text.y - (text.height + 10)), text.width + 20, text.height + 20);
               // drawTextHandles(text.x, text.y, text.width, text.height);    
            }
        }
    }
}


//function drawTextCircle(tx, ty, tradius) {
//    ctx.fillStyle = "#000000";
//    ctx.beginPath();
//    ctx.arc(tx, ty, tradius, 0, 2 * Math.PI);
//    ctx.fill();
//}
//
//function drawTextHandles(hx, hy, hw, hh) {
//    drawTextCircle((hx - 10), (hy - (hh + 10)), 5);
//    drawTextCircle((hw + 20), (hy - (hh + 10)), 5);
//    drawTextCircle((hx - 10), (hh + 20), 5);
//    drawTextCircle((hw + 20), (hh + 20), 5);
//}






// *************************************   SAVE / RESET SECTION ******************************* //

var save = document.getElementById('savebtn');
var reset = document.getElementById('resetbtn');
var resetFilter = document.getElementById('resetfilterbtn');
function saveCanvas() {
    var download = document.getElementById('download');
    download.href = document.getElementById('canvas').toDataURL();
    download.download = 'image.jpeg';
    download.click();
}

save.addEventListener("click", function () {
    Caman('#canvas', imageObj, function () {
        this.render(function () {
            saveCanvas();
        });

    });
});
reset.addEventListener("click", function () {
    Caman('#canvas', imageObj, function () {
        this.revert(false);
        this.reset();
        this.render();
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(imageObj);
    cWidth = 0, cHeight = 0;
    mainimg.setAttribute("style", "width:" + canvas.width + "px; height:" + canvas.height + "px");
    rect.startX = rect.startY = rect.w = rect.h = undefined;
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    canvas2.style.display = "none";
    cropSection.style.display = "none";
    resizeSection.style.display = "none";
    rotateSection.style.display = "none";
    textSection.style.display = "none";
    texts = [];
    rotation = 0;

    var listInput = document.querySelectorAll('input[type="range"]');
    for (var i = 0; i < listInput.length; i++) {
        listInput[i].value = 0;
    }
});

resetFilter.addEventListener("click", function () {
    clearFilter();
});








var brightness = document.getElementById('brightnessbtn');
var noise = document.getElementById('noisebtn');
var sepia = document.getElementById('sepiabtn');
var contrast = document.getElementById('contrastbtn');
var color = document.getElementById('colorbtn');
var vintage = document.getElementById('vintagebtn');
var lomo = document.getElementById('lomobtn');
var emboss = document.getElementById('embossbtn');
var tiltshift = document.getElementById('tiltshiftbtn');
var radialblur = document.getElementById('radialblurbtn');
var edgeenhance = document.getElementById('edgeenhancebtn');
var posterize = document.getElementById('posterizebtn');
var clarity = document.getElementById('claritybtn');
var orangepeel = document.getElementById('orangepeelbtn');
var sincity = document.getElementById('sincitybtn');
var sunrise = document.getElementById('sunrisebtn');
var crossprocess = document.getElementById('crossprocessbtn');
var hazydays = document.getElementById('hazydaysbtn');
var love = document.getElementById('lovebtn');
var grungy = document.getElementById('grungybtn');
var jarques = document.getElementById('jarquesbtn');
var pinhole = document.getElementById('pinholebtn');
var oldboot = document.getElementById('oldbootbtn');
var glowingsun = document.getElementById('glowingsunbtn');
var hdr = document.getElementById('hdrbtn');
var oldpaper = document.getElementById('oldpaperbtn');
var pleasant = document.getElementById('pleasantbtn');

function clearFilter() {
    Caman('#canvas', imageObj, function () {
        if (rotation > 0 || rotation < 0) {
            var rrr = 360 - rotation;
            this.rotate(rrr).render();
        }
        this.revert(false);
        this.rotate(rotation).render();
    });
}

brightness.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.brightness(30).render();
    });
});
noise.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.noise(10).render();
    });
});
sepia.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.sepia(20).render();
    });
});
contrast.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.contrast(10).render();
    });
});
color.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.colorize(60, 105, 218, 10).render();
    });
});
vintage.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.vintage().render();
    });

});
lomo.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.lomo().render();
    });
});
emboss.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.emboss().render();
    });
});
tiltshift.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.tiltShift({
            rotation: 90,
            focusWidth: 600
        }).render();
    });
});
radialblur.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.heavyRadialBlur().render();
    });
});
edgeenhance.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.edgeEnhance().render();
    });
});
posterize.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.posterize().render();
    });
});
clarity.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.clarity().render();
    });
});
orangepeel.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.orangePeel().render();
    });
});
sincity.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.sinCity().render();
    });
});
sunrise.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.sunrise().render();
    });
});
crossprocess.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.crossProcess().render();
    });
});
hazydays.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.hazyDays().render();
    });
});
love.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.love().render();
    });
});
grungy.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.grungy().render();
    });
});
jarques.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.jarques().render();
    });
});
pinhole.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.pinhole().render();
    });
});
oldboot.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.oldBoot().render();
    });
});
glowingsun.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.glowingSun().render();
    });
});
hdr.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.contrast(10);
        this.contrast(10);
        this.jarques();
        this.render();
    });
});
/* Creating custom filters */
Caman.Filter.register("oldpaper", function () {
    this.pinhole();
    this.noise(10);
    this.orangePeel();
    this.render();
});
Caman.Filter.register("pleasant", function () {
    this.colorize(60, 105, 218, 10);
    this.contrast(10);
    this.sunrise();
    this.hazyDays();
    this.render();
});
oldpaper.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.oldpaper();
        this.render();
    });
});
pleasant.addEventListener("click", function () {
    clearFilter();
    Caman('#canvas', imageObj, function () {
        this.pleasant();
        this.render();
    });
}
);
//function clearFilter() {
//    if (rotation > 0 || rotation < 0) {
//        var rrr = 360 - rotation;
//        this.rotate(rrr).render();
//    }
//    this.revert(false);
//    this.rotate(rotation).render();
//}

init();