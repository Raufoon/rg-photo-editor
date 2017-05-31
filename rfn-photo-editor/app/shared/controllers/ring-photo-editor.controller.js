angular.module('ringid.shared')
.controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope', '$element'];

function ringPhotoEditorController($scope, $element) {
    var isPortrait=true,
        canvasW = isPortrait? 55 : 71,
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
}