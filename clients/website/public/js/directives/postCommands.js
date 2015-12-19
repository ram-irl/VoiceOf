voiceOf.directive("voCommands", ['api', function (api)
    {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/postCommands.html',
            scope: {
                post: "=post"
            },
            controller: function ($scope) {
                $scope.postCommand = function () {
                    console.log($scope.post);
                };
            }
        };
        return directive;
    }]);