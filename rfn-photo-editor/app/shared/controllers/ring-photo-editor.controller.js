angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var canvas,
        // offScrnCanvas = document.createElement('canvas'),
        imageObj = new Image(),
        canvasId = 'photo-edit-canvas-id',
        demoImageSrc = 'server/land2.jpg';

    $scope.imageSrc = demoImageSrc;
    $scope.imageHWRatio = 1;
    $scope.optionList = [];
    $scope.optionValues = {};
    $scope.canvImgWidth = 0;
    $scope.canvImgHeight = 0;

    // findImageOrient
    imageObj.src = demoImageSrc;
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
        canvas[0].src = imageObj.src;
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
        $scope.fColors = {
            vintage: '#51a488',
            lomo: '#794044',
            clarity: '#936669',
            sinCity: '#0e2f44',
            sunrise: '#daa520',
            crossProcess: '#8a2be2',
            orangePeel: '#ff7f50',
            love: '#ff4444',
            grungy: '#191970',
            jarques: '#6897bb',
            pinhole: '#999999',
            oldBoot: '#6897bb',
            glowingSun: '#ffa500',
            hazyDays: '#808080',
            herMajesty: '#f6546a',
            nostalgia: '#81d8d0',
            hemingway: '#3b5998',
            concentrate: '#cc0000',
        };
        $scope.fColor = function fColor(filterName) {
            return $scope.fColors[filterName] || '#0099cc';
        }
    }

    function onEdit(optionName) {
        window.Caman('#' + canvasId, function applyEdit() {
            this.revert(false);
            this[optionName]($scope.optionValues[optionName].value);
            this.render();
        });
    }

    function onFilterApply(optionName) {
        window.Caman('#' + canvasId, function applyEdit() {
            this.revert(false);
            this[optionName]();
            this.render();
        });
    }
}