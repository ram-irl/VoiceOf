angular.module("voiceOf.controllers")
        .controller('MasterController', ['$scope', '$rootScope', function ($scope, $rootScope)
            {
                $scope.showDetailPost = function () {
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };
            }]);