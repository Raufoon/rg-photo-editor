angular.module('ringid.shared')
    .controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope'];

function ringPhotoEditorController($scope) {
    var imageObj = new Image(),
        camanJs,
        imageCropper,
        mainCanvasId = 'photo-edit-canvas-id',
        offScreenCanvasId = 'offscr-canvas',
        editHistoryStack = [],
        isHoldForCrop = false,
        demoImageSrc = 'server/port2.jpg';

    // scope variables
    $scope.imageSrc = demoImageSrc;
    $scope.optionList = [];
    $scope.optionValues = {};
    $scope.curOptTab = 'filters';
    $scope.isLoading = false;
    $scope.undoDisable = true;
    $scope.crSel = false; // true: when user draws a rectangle to crop on image

    // scope functions
    $scope.title = capitalizeFirst;
    $scope.onEdit = onEdit;
    $scope.prog = getProgress;
    $scope.onFilterApply = onFilterApply;
    $scope.reset = resetAll;
    $scope.setOptTab = setOptionsTab;
    $scope.undoLast = undoLastAction;
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
        $scope.$digest();
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
            addEditToHistory('crop', cropParam);
            onEdit();
        });
        imageCropper.setCropSelected(false);
    }

    function cancelCrop() {
        imageCropper.setCropSelected(false);
        imageCropper.clearOffSrcCanvas();
    }

    function onEdit(optionName) {
        var editOpts,
            opt,
            i,
            mainCanvas = document.getElementById('photo-edit-canvas-id');

        function onFinishEditing() {
            mainCanvas.style.visibility = 'visible';
            if ($scope.curOptTab === 'crop') {
                imageCropper.initOffSrcCanvas();
                imageCropper.clearOffSrcCanvas();
            }
            toggleLoading();
        }

        toggleLoading();
        if (optionName) addEditToHistory(optionName);
        editOpts = getEditOptionsToApply();

        if (editOpts.length === 0) {
            camanJs.render(onFinishEditing);
            return;
        }

        camanJs.revert(false);
        for (i = 0; i < editOpts.length; i++) {
            opt = editOpts[i];
            if (opt.key === 'crop' || opt.key === 'rotate') continue;
            else if (opt.key === 'filter') camanJs = camanJs[opt.value]();
            else camanJs = camanJs[opt.key](opt.value);
        }
        camanJs.render(onFinishEditing);
    }

    function onFilterApply(optionName) {
        $scope.lastAppliedFilter = optionName;
        onEdit(optionName);
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
            addEditToHistory('rotate');
        });
    }


    // utility functions
    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    function getProgress(optionName) {
        return $scope.optionValues[optionName].value;
    }

    function toggleLoading() {
        $scope.isLoading = !$scope.isLoading;
    }

    function addEditToHistory(optionName, value) {
        /*append the option to the history stack, replace top if identical*/
        var fValue,
            lastEdit,
            isFilter;

        $scope.undoDisable = false;
        if ($scope.optionValues[optionName]) fValue = $scope.optionValues[optionName].value;
        else if (optionName === 'rotate') {
            editHistoryStack.push({
                fname: 'rotate'
            });
            return;
        }
        else if (optionName === 'crop') {
            editHistoryStack.push({
                fname: 'crop',
                value: value
            });
            return;
        }
        else isFilter = true;

        if (isFilter) {
            editHistoryStack.push({
                fname: 'filter',
                value: optionName,
            });
            return;
        }

        if (editHistoryStack.length > 0) {
            lastEdit = editHistoryStack[editHistoryStack.length - 1];
            if (lastEdit.fname === optionName) {
                lastEdit.value = fValue;
                return;
            }
        }
        editHistoryStack.push({
            fname: optionName,
            value: fValue,
        });
    }

    function getEditOptionsToApply() {
        /*returns an array of {key, value} containing unique edit options (filters, options, crop etc.)
         with parameter values*/
        var i = editHistoryStack.length - 1,
            editHistoryObject,
            used = Object.create(null),
            key,
            val,
            optionsToApply = [];
        while (i >= 0) {
            editHistoryObject = editHistoryStack[i];
            if (used[editHistoryObject.fname]
                && editHistoryObject.fname !== 'crop'
                && editHistoryObject.fname !== 'rotate') {
                // adjustment options old values are ignored
                i--;
                continue;
            }

            key = editHistoryObject.fname;
            if (editHistoryObject.fname === 'filter') {
                val = editHistoryObject.value;
            }
            else if (editHistoryObject.fname === 'crop') val = editHistoryObject.value;
            else if (editHistoryObject.fname === 'rotate') val = true;
            else val = parseInt(editHistoryObject.value, 10);

            used[editHistoryObject.fname] = true;
            optionsToApply.push({
                key: key,
                value: val,
            });
            i--;
        }
        return optionsToApply.reverse();
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
        editHistoryStack = [];
        for (i = 0; i < $scope.optionList.length; i++) {
            optionName = $scope.optionList[i];
            $scope.optionValues[optionName].value = 0;
        }
        $scope.lastAppliedFilter = '';
        isHoldForCrop = false;
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

    function undoLastAction() {
        var lastEdit;

        if ($scope.undoDisable) return;
        lastEdit = editHistoryStack.pop();

        if ($scope.optionValues[lastEdit.fname]
            && lastEdit.fname !== 'crop'
            && lastEdit.fname !== 'rotate')
            $scope.optionValues[lastEdit.fname].value = 0;

        if (editHistoryStack.length === 0) {
            resetAll();
            $scope.undoDisable = true;
            return;
        }
    }
}

