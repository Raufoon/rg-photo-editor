angular.module('ringid.shared')
.directive('ringPhotoEditor', ringPhotoEditorDirective);

function ringPhotoEditorDirective() {
    return {
        restrict: 'A',
        templateUrl: 'pages/ring-photo-editor.html',
    }
}