/* global voiceOf */

voiceOf.directive("viewComment", function () {
    var directive = {
        restrict: 'A',
        templateUrl: 'js/directives/comments/view.html',
        transclude: true,
        scope: {
            comment: "=comment"
        },
        controller: function ($scope, $element) {
        }
    };

    return directive;
});
