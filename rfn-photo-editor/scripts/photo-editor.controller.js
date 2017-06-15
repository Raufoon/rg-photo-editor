function ringPhotoEditorController($scope, $ringbox, Ringalert) {
    var imageObj = new Image(),
        camanJs,
        loading = false,
        imageCropper,
        textInserter,
        mainCanvasId = 'photo-edit-canvas-id',
        offScreenCanvasId = 'offscr-canvas',
        adjustmentHistory = Object.create(null),
        demoImageSrc = 'demo-images/port2.jpg';


    // scope variables
    $scope.imageSrc = demoImageSrc;// 'https://' + $scope.imageUrl;
    $scope.optionList = [];
    $scope.optionValues = {};
    $scope.curOptTab = 'filters';
    $scope.lastAppliedFilter = '';
    resetState();


    // scope functions
    $scope.title = capitalizeFirst;
    $scope.adjust = onAdjustment;
    $scope.onFilterApply = onFilterApply;
    $scope.removeFilter = removeFilter;
    $scope.undoCrop = undoCrop;
    $scope.reset = resetAll;
    $scope.setOptTab = setOptionsTab;
    $scope.save = saveEditedImage;
    $scope.rotate = rotateTheCanvas;
    $scope.applyText = applyTextOnMainCanvas;
    $scope.clearText = clearAllTexts;
    $scope.closeRingbox = $ringbox.close;

    // init
    angular.element(document).ready(function initPhotoEditor() {
        imageObj.onload = function onLoadImage() {
            init(this.height > this.width);
        };
        imageObj.onerror = function onFailLoading() {
            Ringalert.show('Could not load image', 'error');
            $ringbox.close();
        }
        imageObj.src = $scope.imageSrc;
    });


    // initialization functions
    function init(isPortrait) {
        $scope.isPortrait = isPortrait;
        initStyles(isPortrait);
        initCanvas();
        initOptions();
        initFilters();
        initCropper();
        initTextInserter();
        setDimension();
        setTabColors();
        $scope.$digest();
    }

    function initStyles(isPortrait) {
        $scope.mdW = isPortrait ? '35%' : '20%';
        $scope.rdW = isPortrait ? '58%' : '73%';
        $scope.filtW = isPortrait ? '48%': '98%';
        $scope.$digest();
    }

    function initCanvas() {
        setLoading(true);
        document.getElementById(mainCanvasId).src = $scope.imageSrc;
        camanJs = window.Caman('#' + mainCanvasId, function () {
            setLoading(false);
        });
    }

    function initOptions() {
        $scope.optionList = [
            'brightness',
            'contrast',
            'saturation',
            'sharpen',
            'exposure',
            'noise',
            'vibrance',
            'sepia',
            'hue',
            'gamma',
            'stackBlur',
            'clip',
        ];
        function prop(min, max, val) {
            this.minValue = min === undefined? -100 : min;
            this.maxValue = max === undefined? 100 : max;
            this.value = val || 0;
            this.default = val || 0;
        }
        $scope.optionValues = {
            brightness: new prop(),
            contrast: new prop(),
            saturation: new prop(),
            sharpen: new prop(0),
            exposure: new prop(),
            vibrance: new prop(),
            hue: new prop(0),
            gamma: new prop(0, 10),
            clip: new prop(0),
            stackBlur: new prop(0, 20),
            noise: new prop(0),
            sepia: new prop(0),
        };
    }

    function initFilters() {
        $scope.filterList = [
            'vintage',
            'jarques',
            'pinhole',
            'oldBoot',
            'glowingSun',
            'hazyDays',
            'herMajesty',
            'nostalgia',
            'lomo',
            'emboss',
            'clarity',
            'sinCity',
            'sunrise',
            'crossProcess',
            'orangePeel',
            'love',
            'grungy',
            'hemingway',
            'concentrate',
            'greyscale',
            'invert',
        ];
    }

    function initCropper() {
        imageCropper = new angular.ringImageCropper($scope, mainCanvasId, offScreenCanvasId, camanJs);
        $scope.cropCancel = imageCropper.onCropCancel;
        $scope.crop = applyCrop;
        $scope.cropCancel = cancelCrop;
    }

    function initTextInserter() {
        var i;
        $scope.noText = true;
        $scope.fonts = [
            'Arial',
            'Times New Roman',
            'Helvetica',
            'sans-serif',
            'monospace',
            'Lucida Console',
            'Courier',
            'Verdana',
            'Georgia',
            'Consolas',
            'Lucida Sans',
            'Open Sans'
        ];
        $scope.fontSizes = [];
        for (i = 15; i< 150; i++) $scope.fontSizes.push(i);

        $scope.html5Color = checkHtml5ColorSupport();
        if ($scope.html5Color === false) {
            $scope.nonHtml5Colors = [
                '#000000',
                '#404040',
                '#0000ff',
                '#b0e0e6',
                '#00ff7f',
                '#6dc066',
                '#ccff00',
                '#ffff00',
                '#f47727',
                '#ff0000',
                '#ff7373',
                '#c39797',
                '#daa520',
                '#ffffff'
            ];
        }

        textInserter = new angular.ringImageTextInserter($scope, mainCanvasId, 'text-canvas');
        $scope.addtext = addTextOnImage;
    }

    function checkHtml5ColorSupport() {
        var inp = document.createElement('input');
        inp.setAttribute('type', 'color');
        return inp.type === 'color';
    }

    function setDimension() {
        var parentDivStyle;
        parentDivStyle = document.getElementById('id-photo-editor-outer').style;
        parentDivStyle.visibility = 'visible';
        parentDivStyle.height = parseInt(window.screen.height * 0.8) + 'px';
        parentDivStyle.width = parseInt(window.screen.width * 0.8) + 'px';
    }

    // feature functions
    function applyCrop() {
        var cropParam = imageCropper.getCropParam(),
            mainCanvas = document.getElementById(mainCanvasId),
            offScrCanvas = document.getElementById(offScreenCanvasId),
            w = cropParam.cropWidth,
            h = cropParam.cropHeight,
            x = cropParam.cropX0,
            y = cropParam.cropY0;
        if (loading) return;

        setLoading(true);
        offScrCanvas.style.visibility = 'hidden';
        mainCanvas.style.visibility = 'hidden';
        camanJs.crop(w, h, x, y).render(function () {
            onEdit();
            $scope.isCropped = true;
        });
        imageCropper.setCropSelected(false);
    }

    function cancelCrop() {
        imageCropper.setCropSelected(false);
        imageCropper.clearOffScreenCanvas();
        imageCropper.clearCropView();
    }

    function undoCrop() {
        setLoading(true);
        $scope.isCropped = false;
        camanJs.reset();
        onEdit();
    }

    function addTextOnImage() {
        textInserter.addtext(
            document.getElementById('id-text-to-add').value,
            document.getElementById('id-font').value,
            document.getElementById('id-font-color').value,
            document.getElementById('id-font-size').value
        );
    }

    function onEdit(optionName) {
        var adjustmentName;

        if (optionName)
            adjustmentHistory[optionName] = parseInt($scope.optionValues[optionName].value, 10);

        camanJs.revert(false);
        if ($scope.hasFilter) camanJs[$scope.lastAppliedFilter]();
        for (adjustmentName in adjustmentHistory)
            camanJs[adjustmentName](adjustmentHistory[adjustmentName]);

        camanJs.render(function onFinishEditing() {
            if ($scope.curOptTab === 'crop') {
                imageCropper.initOffScreenCanvas();
                imageCropper.clearOffScreenCanvas();
                document.getElementById(offScreenCanvasId).style.visibility = 'visible';
            }
            document.getElementById(mainCanvasId).style.visibility = 'visible';
            setLoading(false);
        });

        if (optionName && adjustmentHistory[optionName]
            === $scope.optionValues[optionName].default)
            delete adjustmentHistory[optionName];
    }

    function onAdjustment(adjustmentName) {
        if (loading) return;
        setLoading(true);
        onEdit(adjustmentName);
    }

    function onFilterApply(optionName) {
        if (loading) return;
        setLoading(true);
        $scope.hasFilter = true;
        $scope.lastAppliedFilter = optionName;
        onEdit();
    }

    function removeFilter() {
        if (loading) return;
        setLoading(true);
        $scope.hasFilter = false;
        $scope.lastAppliedFilter = '';
        onEdit();
    }

    function rotateTheCanvas() {
        var mainCanvas = document.getElementById('photo-edit-canvas-id');
        if (loading) return;
        setLoading(true);
        mainCanvas.style.visibility = 'hidden';
        camanJs.rotate(90);
        camanJs.render(function onRender() {
            onEdit();
        });
    }

    function resetAdjustmentValuesToDefault() {
        var i,
            optionName;
        for (i = 0; i < $scope.optionList.length; i++) {
            optionName = $scope.optionList[i];
            $scope.optionValues[optionName].value = $scope.optionValues[optionName].default;
        }
    }

    function resetAll() {
        if (loading) return;
        setLoading(true);
        resetState();
        resetAdjustmentValuesToDefault();
        camanJs.reset();
        camanJs.render(
            function afterRender() {
                if ($scope.curOptTab === 'crop') {
                    imageCropper.initOffScreenCanvas();
                    imageCropper.clearOffScreenCanvas();
                }
                setLoading(false);
            }
        );
    }

    function applyTextOnMainCanvas() {
        var mainCanvas = document.getElementById(mainCanvasId),
            mainCanvasContext = mainCanvas.getContext('2d'),
            i,
            th;
        if (loading) return;
        setLoading(true);
        for (i = 0; i < $scope.textHistory.length; i++) {
            th = $scope.textHistory[i];
            mainCanvasContext.font = th.size+'px '+th.font;
            mainCanvasContext.fillStyle = th.color;
            mainCanvasContext.fillText(th.text, th.x, th.y);
        }

        $scope.noText = true;
        clearAllTexts();
        camanJs.replaceCanvas(cloneCanvas(mainCanvas));
        $scope.isCropped = false;
        $scope.hasFilter = false;
        $scope.lastAppliedFilter = '';
        resetAdjustmentValuesToDefault();
        setLoading(false);
    }

    function clearAllTexts() {
        textInserter.clearAllText();
    }


    // utility functions
    function cloneCanvas(oldCanvas) {
        var newCanvas = document.createElement('canvas'),
            context = newCanvas.getContext('2d');
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        context.drawImage(oldCanvas, 0, 0);
        return newCanvas;
    }

    function capitalizeFirst(string) {
        var name = string.charAt(0).toUpperCase(),
            i,
            ch;
        for (i = 1; i < string.length; i++) {
            ch = string.charAt(i);
            if (ch.toUpperCase() === ch) name += ' '+ch;
            else name+= ch;
        }
        return name;
    }

    function resetState() {
        $scope.lastAppliedFilter = '';
        $scope.crSel = false;
        $scope.isCropped = false;
        $scope.hasFilter = false;
        adjustmentHistory = Object.create(null);
    }


    // UI manipulation functions
    function setOptionsTab(optionsTabTitle) {
        if (loading) return;

        if ($scope.curOptTab === 'crop' && optionsTabTitle !== 'crop') imageCropper.exitCropSection();
        else if ($scope.curOptTab === 'text' && optionsTabTitle !== 'text') textInserter.exit();

        $scope.curOptTab = optionsTabTitle;

        if (optionsTabTitle === 'crop') imageCropper.enterCropSection();
        else if (optionsTabTitle === 'text') textInserter.initTextOptions();

        setTabColors();
    }

    function setTabColors() {
        var i,
            tabs = document.getElementsByClassName('pe-left-opt-btn'),
            activeTab = document.getElementById('tab-'+ $scope.curOptTab);
        for (i = 0; i < tabs.length; i++) tabs[i].style.backgroundColor = '#f0f1f3';
        activeTab.style.backgroundColor = 'white';
    }

    function setLoading(flag) {
        var loaderCanvas = document.getElementById('loader-canvas'),
            mainCanvas,
            l,
            loadingText = 'Loading...',
            ctx;

        loading = flag;

        if (loading) {
            mainCanvas = document.getElementById(mainCanvasId);
            loaderCanvas.style.display = 'block';
            loaderCanvas.width = mainCanvas.width;
            loaderCanvas.height = mainCanvas.height;
            ctx = loaderCanvas.getContext('2d');
            ctx.font = '60px Arial';
            ctx.fillStyle = '#f47727';
            l = (ctx.measureText(loadingText).width)/2;
            ctx.fillText(loadingText, loaderCanvas.width/2 -l, loaderCanvas.height/2);
        }
        else {
            loaderCanvas.style.display = 'none';
        }
    }

    function saveEditedImage() {
        $scope.saveFunction(document.getElementById('photo-edit-canvas-id'));
        $ringbox.close();
    }
}

angular.ringPhotoEditorController = ringPhotoEditorController;
angular.ringImageCropper = ringImageCropper;
angular.ringImageTextInserter = ringImageTextInserter;

// angular.module('ringid')
//     .controller('ringPhotoEditorController', ['$scope', '$ringbox', ringPhotoEditorController]);