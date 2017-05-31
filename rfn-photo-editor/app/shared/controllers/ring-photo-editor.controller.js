angular.module('ringid.shared')
    .controller('ringPhotoEditorController', ringPhotoEditorController);

ringPhotoEditorController.$inject = ['$scope'];

function ringPhotoEditorController($scope) {
    var isPortrait = false;
    $scope.pebW = isPortrait? '55%' : '100%';
    $scope.pebH = isPortrait? '100%' : '75%';
    $scope.eopW = isPortrait? '45%': '100%';
    $scope.eopH = isPortrait? '100%': '25%';
    $scope.img = 'fake-server/portrait.jpg';
}