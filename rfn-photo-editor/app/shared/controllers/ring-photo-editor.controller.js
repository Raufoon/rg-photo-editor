angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var canvas,
        imageObj = new Image(),
        canvasId = 'photo-edit-canvas-id',
        editHistoryStack,
        isHoldForCrop = false,
        demoImageSrc = 'server/port.jpg';

    $scope.imageSrc = demoImageSrc;
    // find image orientation
    imageObj.src = $scope.imageSrc;
    imageObj.onload = function fn() {
        init(this.height > this.width);
        $scope.$digest();
    };

    $scope.optionList = [];
    $scope.optionValues = {};
    $scope.curOptTab = 'filters';
    editHistoryStack = []; // ** replace top if same option added
    $scope.isLoading = false;
    $scope.undoDisable = true;

    // scope functions
    $scope.title = capitalizeFirst;
    $scope.onEdit = onEdit;
    $scope.prog = getProgress;
    $scope.onFilterApply = onFilterApply;
    $scope.reset = resetAll;
    $scope.setOptTab = setOptionsTab;
    $scope.undoLast = undoLastAction;

    // initialization function
    function init(isPortrait) {
        $scope.isPortrait = isPortrait;
        initStyles(isPortrait);
        initCanvas();
        initOptions();
        initFilters();
        $scope.$digest();
    }

    function initStyles(isPortrait) {
        $scope.mdW = isPortrait ? '35%' : '20%';
        $scope.rdW = isPortrait ? '59%' : '74%';
        $scope.filtW = isPortrait ? '48%': '98%';
    }

    function initCanvas() {
        canvas = angular.element(document.getElementById(canvasId));
        canvas[0].src = $scope.imageSrc;
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

    // utility functions
    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    function getProgress(optionName) {
        return $scope.optionValues[optionName].value;
    }

    function addEditToHistory(optionName) {
        var fValue,
            lastEdit,
            isFilter;

        if ($scope.optionValues[optionName])
            fValue = $scope.optionValues[optionName].value;
        else
            isFilter = true;

        $scope.undoDisable = false;

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
        var returnObj = Object.create(null),
            i,
            editHistoryObject;

        for (i = 0; i < editHistoryStack.length; i++) {
            editHistoryObject = editHistoryStack[i];
            if (editHistoryObject.fname === 'filter')
                returnObj[editHistoryObject.fname] = editHistoryObject.value;
            else returnObj[editHistoryObject.fname] = parseInt(editHistoryObject.value, 10);
        }
        return returnObj;
    }

    // event handling functions

    function onEdit(optionName) {
        function applyEdit() {
            var editOpts,
                opt;

            toggleLoading();
            addEditToHistory(optionName);
            // TODO: optionName = filter hoile eto effect fela dorkar nai, ekbar e enough
            editOpts = getEditOptionsToApply();

            this.revert(false);
            for (opt in editOpts) {
                // TODO: opt gula ordered vabe execute korte hobe :|
                if (opt === 'filter') this[editOpts[opt]]();
                else this[opt](editOpts[opt]);
            }
            this.render(toggleLoading);
        }
        window.Caman('#' + canvasId, applyEdit);
    }

    function onFilterApply(optionName) {
        onEdit(optionName);
    }

    function toggleLoading() {
        $scope.isLoading = !$scope.isLoading;
    }

    function resetAll() {
        var i,
            optionName;
        window.Caman('#' + canvasId, function resetFunc() {
            this.reset();
        });
        editHistoryStack = [];
        for (i = 0; i < $scope.optionList.length; i++) {
            optionName = $scope.optionList[i];
            $scope.optionValues[optionName].value = 0;
        }
    }

    function setOptionsTab(optionsTabTitle) {
        if ($scope.curOptTab === 'crop' && optionsTabTitle !== 'crop')
            exitCropSection();

        $scope.curOptTab = optionsTabTitle;

        if (optionsTabTitle === 'crop')
            initCropSection();
    }
    
    function undoLastAction() {
        var lastEdit;
        if ($scope.undoDisable) return;

        lastEdit = editHistoryStack.pop();
        if (lastEdit.fname !== 'filter')
            $scope.optionValues[lastEdit.fname].value = 0;

        if (editHistoryStack.length === 0) {
            resetAll();
            $scope.undoDisable = true;
            return;
        }
        toggleLoading();
        window.Caman('#' + canvasId, function onUndo() {
            var editOpts = getEditOptionsToApply();
            this.revert(false);
            for (opt in editOpts) {
                if (opt === 'filter') this[editOpts[opt]]();
                else this[opt](editOpts[opt]);
            }
            this.render(toggleLoading);
        });
    }

    // crop related functions
    function initCropSection() {
        window.Caman('#' + canvasId, $scope.imageSrc, function fn() {
            this.render(function onRender() {
                canvas = angular.element(document.getElementById(canvasId));
                canvas.on('mouseup', mouseUpOnCanvas);
                canvas.on('mousedown', mouseDownOnCanvas);
                canvas.on('mousemove', mouseMoveOnCanvas);
            });
        });
    }
    
    function exitCropSection() {
        isHoldForCrop = false;
        canvas.off('mouseup', mouseUpOnCanvas);
        canvas.off('mousedown', mouseDownOnCanvas);
        canvas.off('mousemove', mouseMoveOnCanvas);
    }
    
    function mouseUpOnCanvas() {
        isHoldForCrop = false;
    }
    
    function mouseDownOnCanvas() {
        isHoldForCrop = true;
    }

    $scope.TEST = 0;
    function mouseMoveOnCanvas(event) {
        if (!isHoldForCrop) {

        } else {
            $scope.TEST +=1;
            $scope.$digest();
        }
    }
}