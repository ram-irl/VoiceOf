angular.module("voiceOf.controllers")
        .controller('MasterController', ['$scope', '$rootScope', 'api', function ($scope, $rootScope, api)
            {
                $scope.validLocation=null;
                //Show command for specific post
                $scope.showDetailPost = function () {
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };
                $scope.checkLocationAvailable = function () {
                    api.checkLocationAvailable(function (err, data) {
                        if(data.results.length==0){
                            $scope.validLocation=false;
                        }else{
                            $scope.validLocation=true;
                        }
                        console.log(data.results.length);
                    });
                };
                //Select artifact
                $scope.selectArtifact=function(){
                    angular.element("#artifact_upload").click();
                };
                //Keep selected file
                $scope.fileSelected = function ($files, $event) {
                    console.log("test");
                    console.log($files);
                };
            }]);