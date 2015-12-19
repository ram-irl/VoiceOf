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
                $scope.openFbPopUp = function () {
                    var content1 = $scope.post;
                    console.log(JSON.stringify(content1));
                    console.log("openFbPopUp called...");
                    try {
                        FB.ui(
                                {
                                    method: 'feed',
                                    name: 'Facebook Share',
                                    //link: 'https://chillana.in',
                                    link: 'http://localhost:3000/sharedurl=http://google.co.in',
                                    picture: 'https://chillana.in/img/logo.png',
                                    caption: 'Reference Documentation',
                                    description: 'Dialogs provide a simple, consistent interface for applications to interface with users.'
                                },
                                function (response) {
                                    if (response && response.post_id) {
                                        alert('Post was published successful.');
                                    } else {
                                        alert('Post was not published.');
                                    }
                                }
                        );
                    } catch (e) {
                        alert(e);
                    }
                    console.log("openFbPopUp end...");
                };
                
                //Change post status to complete
                $scope.postComplete=function(){
                    api.postComplete($scope.post._id, function (err, data) {
                        if (data != null) {
                            alert("Post Completed.");
                        }else{
                            alert("Error");
                        }
                    });
                };
            }
        };
        return directive;
    }]);