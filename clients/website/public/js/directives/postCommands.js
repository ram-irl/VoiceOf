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
                    var postObj = $scope.post;
                    //alert((postObj === 'undefined')?"true":"false");
                    //alert(JSON.stringify(postObj));
                    postObj = JSON.parse(postObj);
                    //console.log(JSON.stringify(content1));
                    //console.log("openFbPopUp called...");
                    try {
                        FB.ui(
                                {
                                    method: 'feed',
                                    name: 'Facebook Share',
                                    //link: 'https://chillana.in',
                                    //link: 'http://localhost:3000?sharedurl=5675109d37a24203000dc1b7',
                                    link: 'https://chillana.in?sharedurl='+postObj._id,
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
                };
                $scope.votePost = function () {
                   
                    var postObj = $scope.post;
                    var postid = postObj._id;
                    console.log("votePost ID: "+postid);
                
                   api.votePost(postid, function (err, data) {
                        if (err) {
                            console.log("votePost Error: "+err);
                        } else {
                            console.log("votePost Success");                            
                        }
                    });
                };
            }
        };
        return directive;
    }]);