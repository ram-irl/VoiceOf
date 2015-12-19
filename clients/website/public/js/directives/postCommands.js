voiceOf.directive("voCommands", ['api', '$rootScope', function (api, $rootScope)
    {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/postCommands.html',
            scope: {
                post: "=post"
            },            
            link: function ($scope) {   
                $scope.showCommentsLoading = false;
                $scope.getComments = function () {
                    if(!$scope.post._id)return;
                    $scope.showCommentsLoading = true;
                    api.getAllComments($scope.post._id, function (err, data) {
                        $scope.showCommentsLoading = false;
                        if (err) {
                            console.log(err);
                        } else {
                            $scope.post.comments = data;
                        }
                    });
                };
                $scope.$watch('post._id', function(newval, oldval) {
                    $scope.getComments();
                });
                $scope.postCommand = function () {
                    console.log($scope.post);
//                    var postId=$scope.post;
//                    api.postCommand(function (err, data){
//                        
//                    });
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
            }
        };
        return directive;
    }]);