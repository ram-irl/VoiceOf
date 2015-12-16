voiceOf.directive("voCommands", function ()
{
    var directive = {
        restrict: 'E',
        templateUrl: 'views/postCommands.html',
        controller: function ($scope) {
            $scope.test = "Example";
        }     
    };
    return directive;
});