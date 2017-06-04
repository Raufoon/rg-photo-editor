angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var canvas,
        imageObj = new Image(),
        canvasId = 'photo-edit-canvas-id',
        editHistoryStack,
        demoImageSrc = 'server/port2.jpg';

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


    // scope functions
    $scope.title = capitalizeFirst;
    $scope.onEdit = onEdit;
    $scope.prog = getProgress;
    $scope.onFilterApply = onFilterApply;
    $scope.reset = resetAll;
    $scope.setOptTab = setOptionsTab;

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
            contrast: new prop(-10, 10),
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
            returnObj[editHistoryObject.fname] = editHistoryObject.value;
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
            editOpts = getEditOptionsToApply();

            this.revert(false);
            for (opt in editOpts) {
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
        $scope.$digest();
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
        $scope.curOptTab = optionsTabTitle;
    }
}