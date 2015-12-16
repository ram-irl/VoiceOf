voiceOf.directive("voPost", ['api', function (api)
    {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/post.html',
            controller: function ($scope) {
                $scope.test = "Example";
                api.getAllpost(function(err,data){
                    console.log(data);
                });
            }
        };
        return directive;
    }]);