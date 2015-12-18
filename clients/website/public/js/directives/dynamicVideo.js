
voiceOf.directive('dynamicUrl', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            url: "=url"
        },
        link: function ($scope, element, attrs) {
            element.attr('src', $scope.url);
        }
    };
});