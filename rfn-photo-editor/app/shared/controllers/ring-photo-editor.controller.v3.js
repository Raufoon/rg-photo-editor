angular.module('ringid.shared')
    .controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope'];

function ringPhotoEditorController($scope) {
    var imageObj = new Image(),
        camanJs,
        imageCropper,
        textInserter,
        mainCanvasId = 'photo-edit-canvas-id',
        offScreenCanvasId = 'offscr-canvas',
        adjustmentHistory = Object.create(null),
        demoImageSrc = 'server/port2.jpg';


    // scope variables
    $scope.imageSrc = demoImageSrc;
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
        $scope.mdW = isPortrait ? '35%' : '20%';
        $scope.rdW = isPortrait ? '59%' : '74%';
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
        $scope.isCropped = false;
        camanJs.reset();
        onEdit();
    }

    function onEdit(optionName) {
        var adjustmentName,
            i;

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
        });

        if (optionName && adjustmentHistory[optionName] === $scope.optionValues[optionName].default)
            delete adjustmentHistory[optionName];
    }

    function onAdjustment(adjustmentName) {
        onEdit(adjustmentName);
    }

    function onFilterApply(optionName) {
        $scope.hasFilter = true;
        $scope.lastAppliedFilter = optionName;
        onEdit();
    }

    function removeFilter() {
        $scope.hasFilter = false;
        $scope.lastAppliedFilter = '';
        onEdit();
    }

    function saveEditedImage() {
        var image = new Image(),
            mainCanvas = document.getElementById('photo-edit-canvas-id');
        image.src = mainCanvas.toDataURL(); // the image object holds the edited image :)
        document.getElementById('testimg').src = image.src;
    }

    function rotateTheCanvas() {
        var mainCanvas = document.getElementById('photo-edit-canvas-id');
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
        resetState();
        resetAdjustmentValuesToDefault();
        camanJs.reset();
        camanJs.render(
            function afterRender() {
                if ($scope.curOptTab === 'crop') {
                    imageCropper.initOffSrcCanvas();
                    imageCropper.clearOffSrcCanvas();
                }
            }
        );
    }

    function applyTextOnMainCanvas() {
        var mainCanvas = document.getElementById(mainCanvasId),
            mainCanvasContext = mainCanvas.getContext('2d'),
            i,
            th;

        for (i = 0; i < $scope.textHistory.length; i++) {
            th = $scope.textHistory[i];
            mainCanvasContext.font = th.size+'px '+th.font;
            mainCanvasContext.fillStyle = th.color;
            mainCanvasContext.fillText(th.text, th.x, th.y);
        }
        $scope.noText = true;
        clearAllTexts();
        camanJs.replaceCanvas(mainCanvas);
        $scope.hasFilter = false;
        $scope.lastAppliedFilter = '';
        resetAdjustmentValuesToDefault();
    }

    function clearAllTexts() {
        textInserter.clearAllText();
    }


    // utility functions
    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
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
        if ($scope.curOptTab === 'crop' && optionsTabTitle !== 'crop') {
            // leaving crop section
            imageCropper.exitCropSection();
        }
        else if ($scope.curOptTab === 'text' && optionsTabTitle !== 'text') {
            // leaving text insertion section
            textInserter.exit();
        }

        $scope.curOptTab = optionsTabTitle;

        if (optionsTabTitle === 'crop') {
            // entering crop section
            imageCropper.initCropSection();
        }
        else if (optionsTabTitle === 'text') {
            // entering text section
            textInserter.init();
        }
    }


    // debug
    window.getScope = function () {
        return $scope;
    }
    window.mainCanvas = function () {
        return angular.element(document.getElementById(mainCanvasId));
    }
}

