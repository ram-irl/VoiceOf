voiceOf.directive("voCommands", ['api', function (api)
    {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/postCommands.html',
            scope: {
                post: "=post"
            },
            controller: function ($scope) {
                $scope.cmdSelFile = null;
                //On file select, save file in scope varible
                $scope.cmdfileSelected=function($files){
                    $scope.cmdSelFile = $files[0];
                };
                
                //Post commands
                $scope.postCommand = function () {
                    if ($('#cmdTxt').val() == "") {
                        alert("Please enter command.");
                        return;
                    }

                    api.postCommand($scope.post._id, $scope.cmdSelFile, function (err, data) {
                        if (data != null) {
                            $scope.cmdSelFile = null;
                            $scope.cmdTxt="";
                            alert("Command submitted.");
                        }else{
                            alert("Error");
                        }
                    });
                };
                
                //Remove selected file
                $scope.removeCmdSelFile = function () {
                    $scope.cmdSelFile = null;
                };
            }
        };
        return directive;
    }]);