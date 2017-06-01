angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var canvas,
        // offScrnCanvas = document.createElement('canvas'),
        imageObj = new Image(),
        canvasId = 'photo-edit-canvas-id',
        demoImageSrc = 'server/port2.jpg';

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

    // function definitions
    function init(isPortrait) {
        // widths and heights for the UI
        var canvasW = isPortrait? 55 : 71,
            canvasH = isPortrait? 100 : 70,
            filtersW = isPortrait? 16 : 71,
            filtersH = isPortrait? 100 : 30,
            optionsW = isPortrait? 20 : 20;

        $scope.lW = (isPortrait? canvasW + filtersW : canvasW) + '%';
        $scope.lH = '100%';
        $scope.mW = optionsW + '%';
        $scope.cW = (isPortrait? 80 : 100) + '%';
        $scope.cH = (isPortrait? 100 : 80) + '%';
        $scope.fW = (isPortrait? 20 : 100) + '%';
        $scope.fH = (isPortrait? 100 : 20) + '%';

        initCanvas();
        initOptions();

        $scope.$digest();
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    function getProgress(optionName) {
        return ($scope.optionValues[optionName] + 100)/2;
    }

    // function drawImage() {
    //     canvas[0].src = imageObj.src;
    //     // canvas[0].getContext('2d')
    //     //     .drawImage(imageObj, 0, 0, $scope.canvImgWidth, $scope.canvImgHeight);
    // }

    function initCanvas() {
        canvas = angular.element(document.getElementById(canvasId));
        setCanvasImageDimension();
        canvas[0].src = imageObj.src;
    }

    function setCanvasImageDimension() {
        var canvasHeight = canvas[0].height,
            canvasWidth = canvas[0].width,
            ratioImgWH = parseFloat(imageObj.width) / parseFloat(imageObj.height);

        $scope.canvImgHeight = Math.min(imageObj.height, canvasHeight);
        $scope.canvImgWidth = parseInt(parseFloat($scope.canvImgHeight) * ratioImgWH);

        if ($scope.canvImgWidth > canvasWidth) {
            $scope.canvImgWidth = canvasWidth;
            $scope.canvImgHeight = canvasWidth / imageObj.width * imageObj.height;
        }
    }

    function initOptions() {
        var i;
        $scope.optionList = [
            'brightness',
            'contrast',
            'sharpen',
            'saturation',
            'exposure',
            'vibrance',
            'hue',
            'gamma',
            'noise',
            'sepia',
            'stackBlur',
        ];
        for (i = 0; i<$scope.optionList.length; i++)
            $scope.optionValues[ $scope.optionList[i] ] = 0;
    }

    function onEdit(optionName) {
        window.Caman('#' + canvasId, function applyEdit() {
            this[optionName]($scope.optionValues[optionName]).render();
        });
    }
}