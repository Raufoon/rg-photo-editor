angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var canvas,
        // offScrnCanvas = document.createElement('canvas'),
        imageObj = new Image(),
        canvasId = 'photo-edit-canvas-id',
        demoImageSrc = 'server/land.jpg';

    $scope.imageSrc = demoImageSrc;
    $scope.optionList = [];
    $scope.optionValues = {};

    // find image orientation
    imageObj.src = $scope.imageSrc;
    imageObj.onload = function fn() {
        init(this.height > this.width);
        $scope.$digest();
    };

    // scope functions
    $scope.title = capitalizeFirst;
    $scope.onEdit = onEdit;
    $scope.prog = getProgress;
    $scope.onFilterApply = onFilterApply;

    // function definitions
    function init(isPortrait) {
        $scope.isPortrait = isPortrait;
        initStyles(isPortrait);
        initCanvas();
        initOptions();
        initFilters();
        $scope.$digest();
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    function getProgress(optionName) {
        return $scope.optionValues[optionName].value;
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

    function onEdit(optionName) {
        window.Caman('#' + canvasId, function applyEdit() {
            var option = $scope.optionValues[optionName];

            this.revert(false);

            if (option) this[optionName](option.value);
            else this[optionName]();

            this.render();
        });
    }

    function onFilterApply(optionName) {
        onEdit(optionName);
    }
}