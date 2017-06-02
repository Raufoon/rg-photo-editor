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
    editHistoryStack = []; // ** replace top if same option added


    // scope functions
    $scope.title = capitalizeFirst;
    $scope.onEdit = onEdit;
    $scope.prog = getProgress;
    $scope.onFilterApply = onFilterApply;
    $scope.reset = resetAll;

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
        var canvasW = isPortrait? 55 : 71,
            // canvasH = isPortrait? 100 : 70,
            filtersW = isPortrait? 16 : 71,
            // filtersH = isPortrait? 100 : 30,
            optionsW = isPortrait? 20 : 20;

        $scope.lW = (isPortrait? canvasW + filtersW : canvasW) + '%';
        $scope.lH = '100%';
        $scope.mW = optionsW + '%';
        $scope.cW = (isPortrait? 80 : 100) + '%';
        $scope.cH = (isPortrait? 100 : 85) + '%';
        $scope.fW = (isPortrait? 20 : 100) + '%';
        $scope.fH = (isPortrait? 100 : 15) + '%';
    }

    function initCanvas() {
        canvas = angular.element(document.getElementById(canvasId));
        canvas[0].src = $scope.imageSrc;
    }

    function initOptions() {
        $scope.optionList = [
            'brightness',
            'contrast',
            'sharpen',
            'saturation',
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
            lastEdit;

        if ($scope.optionValues[optionName])
            fValue = $scope.optionValues[optionName].value;
        else
            fValue = 'filter';

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

            addEditToHistory(optionName);
            editOpts = getEditOptionsToApply();

            this.revert(false);
            for (opt in editOpts) {
                if (editOpts[opt] === 'filter') this[opt]();
                else this[opt](editOpts[opt]);
            }
            this.render();
        }
        window.Caman('#' + canvasId, applyEdit);
    }

    function onFilterApply(optionName) {
        onEdit(optionName);
    }

    function resetAll() {
        window.Caman('#' + canvasId, function resetFunc() {
            this.revert(false);
            this.render();
        });
    }
}