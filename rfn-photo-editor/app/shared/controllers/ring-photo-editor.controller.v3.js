angular.module('ringid.shared')
    .controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope'];

function ringPhotoEditorController($scope) {
    var imageObj = new Image(),
        camanJs,
        imageCropper,
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
    $scope.prog = getProgress;
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


    // feature functions
    function applyCrop() {
        var cropParam = imageCropper.getCropParam(),
            mainCanvas = document.getElementById(mainCanvasId),
            w = cropParam.cropWidth,
            h = cropParam.cropHeight,
            x = cropParam.cropX0,
            y = cropParam.cropY0;

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
    }

    function onEdit(optionName) {
        var adjustmentName,
            i;


        if (optionName)
            adjustmentHistory[optionName] = parseInt($scope.optionValues[optionName].value, 10);
        camanJs.revert(false);

        // apply last filter
        if ($scope.hasFilter) camanJs[$scope.lastAppliedFilter]();

        // then:
        for (adjustmentName in adjustmentHistory)
            camanJs[adjustmentName](adjustmentHistory[adjustmentName]);

        camanJs.render(function onFinishEditing() {
            if ($scope.curOptTab === 'crop') {
                imageCropper.initOffSrcCanvas();
                imageCropper.clearOffSrcCanvas();
            }
            document.getElementById(mainCanvasId).style.visibility = 'visible';
        });

        if (optionName && adjustmentHistory[optionName] === $scope.optionValues[optionName].default)
            delete adjustmentHistory[optionName];
    }

    function onAdjustment(adjustmentName, force) {
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


    // utility functions
    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    function getProgress(optionName) {
        return $scope.optionValues[optionName].value;
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

    // UI manipulation functions
    function setOptionsTab(optionsTabTitle) {
        if ($scope.curOptTab === 'crop' && optionsTabTitle !== 'crop') imageCropper.exitCropSection();

        $scope.curOptTab = optionsTabTitle;

        if (optionsTabTitle === 'crop') imageCropper.initCropSection();
    }

    function resetAll() {
        var i,
            optionName;

        // reset history
        resetState();
        for (i = 0; i < $scope.optionList.length; i++) {
            optionName = $scope.optionList[i];
            $scope.optionValues[optionName].value = 0;
        }
        // isHoldForCrop = false;
        camanJs.reset();
        camanJs.render(
            function () {
                if ($scope.curOptTab === 'crop') {
                    imageCropper.initOffSrcCanvas();
                    imageCropper.clearOffSrcCanvas();
                }
            }
        );
    }

    function resetState() {
        $scope.lastAppliedFilter = '';
        $scope.crSel = false;
        $scope.isCropped = false;
        $scope.hasFilter = false;
        adjustmentHistory = Object.create(null);
    }

    // debug
    window.getScope = function () {
        return $scope;
    }
}

