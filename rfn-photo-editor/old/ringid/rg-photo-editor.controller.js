angular.module('ringid.shared')
    .controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$ringbox'];

function ringPhotoEditorController($scope, $ringbox) {
    var imageObj = new Image(),
        camanJs,
        loading = false,
        imageCropper,
        textInserter,
        mainCanvasId = 'photo-edit-canvas-id',
        offScreenCanvasId = 'offscr-canvas',
        adjustmentHistory = Object.create(null),
        demoImageSrc = 'server/port2.jpg';


    // scope variables
    $scope.imageSrc = 'https://' + $scope.imageUrl;
    $scope.optionList = [];
    $scope.optionValues = {};
    $scope.curOptTab = 'filters';
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
    $scope.lastAppliedFilter = '';
    $scope.btncol = getButtonBackgroundColor;
    $scope.filtBtnCol = getFilterButtonBackgroundColor;
    $scope.rotate = rotateTheCanvas;
    $scope.applyText = applyTextOnMainCanvas;
    $scope.clearText = clearAllTexts;
    $scope.closeRingbox = $ringbox.close;

    // init
    angular.element(document).ready(function initPhotoEditor() {
        imageObj.src = $scope.imageSrc;
        imageObj.onload = function onLoadImage() {
            init(this.height > this.width);
        };
    });


    // initialization functions
    function init(isPortrait) {
        $scope.isPortrait = isPortrait;
        initStyles(isPortrait);
        initCanvas();
        initOptions();
        initFilters();
        initCropper();
        initFontOptions();
        $scope.$digest();
    }

    function initStyles(isPortrait) {
        $scope.W = window.screen.width * 0.8;
        $scope.H = window.screen.height * 0.8;
        $scope.mdW = isPortrait ? '35%' : '20%';
        $scope.rdW = isPortrait ? '58%' : '73%';
        $scope.filtW = isPortrait ? '48%': '98%';
        $scope.$digest();
    }

    function initCanvas() {
        document.getElementById(mainCanvasId).src = $scope.imageSrc;
        camanJs = window.Caman('#' + mainCanvasId);
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
        imageCropper = new ringImageCropper($scope, mainCanvasId, offScreenCanvasId, camanJs);
        $scope.cropCancel = imageCropper.onCropCancel;
        $scope.crop = applyCrop;
        $scope.cropCancel = cancelCrop;
    }

    function initFontOptions() {
        var i;
        $scope.fontSizes = [];
        for (i = 10; i< 101; i++) $scope.fontSizes.push(i);
        $scope.fonts = [
            'Arial',
            'Helvetica',
            'Times New Roman',
            'Courier New',
            'Verdana',
            'Georgia',
            'Palatino',
            'Garamond',
            'Comic Sans MS',
            'Impact',
        ];
        textInserter = new ringImageTextInserter($scope, mainCanvasId, 'text-canvas');
        $scope.addtext = function addText() {
            textInserter.addtext(
                document.getElementById('id-text-to-add').value,
                document.getElementById('id-font').value,
                document.getElementById('id-font-color').value,
                document.getElementById('id-font-size').value
            );
        };
        $scope.noText = true;
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
        imageCropper.clearOffSrcCanvas();
    }

    function undoCrop() {
        setLoading(true);
        $scope.isCropped = false;
        camanJs.reset();
        onEdit();
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
                imageCropper.initOffSrcCanvas();
                imageCropper.clearOffSrcCanvas();
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

    function saveEditedImage() {
        // TODO
        // var image = new Image(),
        //     mainCanvas = document.getElementById('photo-edit-canvas-id');
        // image.src = mainCanvas.toDataURL(); // the image object holds the edited image :)
        // document.getElementById('testimg').src = image.src;
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
                    imageCropper.initOffSrcCanvas();
                    imageCropper.clearOffSrcCanvas();
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

    function getButtonBackgroundColor(tabname, hover, selectCol, menterCol, mleavCol) {
        if ($scope.curOptTab === tabname) return selectCol || 'white';
        if (hover) return menterCol || '#ecf0f7';
        return mleavCol || '#f0f1f3';
    }

    function getFilterButtonBackgroundColor(filterName, hover, selectCol, menterCol, mleavCol) {
        if ($scope.lastAppliedFilter === filterName) return selectCol || 'white';
        if (hover) return menterCol || '#3399ff';
        return mleavCol || '#0089b7';
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

        if (optionsTabTitle === 'crop') imageCropper.initCropSection();
        else if (optionsTabTitle === 'text') textInserter.initTextOptions();
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
}

