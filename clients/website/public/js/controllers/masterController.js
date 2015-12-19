angular.module("voiceOf.controllers")
        .controller('MasterController', ['$scope', '$rootScope', 'api', '$upload', '$window', function ($scope, $rootScope, api, $upload, $window)
            {
                //selected file in scope
                $scope.selFile = null;
                //Check it is a valid location
                $scope.validLocation = null;
                //Show command for specific post

                $scope.post = {};

                $scope.refreshPins = function (location) {
                    var url = "?lat=" + location.lat + "&lng=" + location.lng + "&rad=" + ($window.distanceRadius);
                    console.log(url);
                    api.getAllpost(url, function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            $window.mresults = data;

                            $window.rearrangeMarkers(location);
                            
                            //$scope.openfbContent();
                        }
                    });
                };

                $scope.showDetailPost = function (index) {
                    $scope.$apply(function () {
                        $scope.post = $window.mresults[index];
                        var jsonContent = angular.fromJson($scope.post.content);
                        $scope.post.jsonContent = {};
                        $scope.post.jsonContent = jsonContent;
                        //hardCodeComments();
                    });
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };
                $scope.checkLocationAvailable = function () {
                    if ($("#addressMsg").val().length == 0) {
                        alert("Please enter location");
                        return;
                    }
                    api.checkLocationAvailable(function (err, data) {
                        if (data.results.length == 0) {
                            $scope.validLocation = false;
                        } else {
                            $scope.validLocation = true;
                            $scope.resultLat = data.results[0].geometry.location.lat;
                            $scope.resultLan = data.results[0].geometry.location.lng;
                            $scope.searchLocation = {lat: $scope.resultLat, lng: $scope.resultLan};

                            //clear marker and pin marker
                            $scope.setMapOnAll(null, $scope.searchLocation);
                        }
                    });
                };
                $scope.setCurrentLoc = function () {
                    //clear marker and pin marker
                    $scope.setMapOnAll(null, currentLocation);
                    $scope.validLocation = null;
                    $scope.locationTxt = "";
                };
                $scope.setMapOnAll = function (val, location) {
                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setMap(val);
                    }
                    markers = [];
                    map.setCenter(location);
                    var userMarker = new google.maps.Marker({
                        position: location,
                        map: map,
                        title: 'Your Current Location'
                    });
                    markers.push(userMarker);
                };
                //Select artifact
                $scope.selectArtifact = function () {
                    angular.element("#artifact_upload").click();
                };
                //Keep selected file
                $scope.fileSelected = function ($files) {
                    $scope.selFile = $files[0];
                };

                //Submit post
                $scope.postSubmit = function () {
                    if ($('#txtMsg').val() == "") {
                        alert("Please enter message.");
                        return;
                    }

                    if ($scope.validLocation) {
                        var jsonData = {content: {msg: $scope.txtMessage, stayAnonmous: $('#stayAnoVal').is(':checked')}, position: [$scope.resultLan, $scope.resultLat]};
                    } else {
                        var jsonData = {content: {msg: $scope.txtMessage, stayAnonmous: $('#stayAnoVal').is(':checked')}, position: [currentLocation.lng, currentLocation.lat]};
                    }

                    api.submitPost(jsonData, $scope.selFile, function (err, data) {
                        if (data != null) {
                            $scope.locationTxt = "";
                            $scope.txtMessage = "";
                            $scope.selFile = null;
                            alert("Your shout tweeted!");
                            $scope.refreshPins({lat: jsonData.position[0], lng: jsonData.position[1]});
                        } else {
                            alert("Error");
                        }
                    });
                };

//Remove selected file
                $scope.removeSelFile = function () {
                    $scope.selFile = null;
                };


                //Remove selected file
                $scope.removeSelFile = function () {
                    $scope.selFile = null;
                };

                $scope.openfbContent = function () {
                    //mresults
                    var variable = "sharedurl";
                    //alert("openfbContent start");
                    var query = "";
                    query = "" + window.location;//hosted check
                    //query = "https://chillana.in/?sharedurl=5675109d37a24203000dc1b7";//local check
                    console.log(query);                    
                    var vars = query.split("?");
                    console.log(vars);
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair[0] == variable) {
                            sharedID = pair[1];
                        }
                    }
                    
                    api.getPostByID(sharedID, function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("obj: "+data);
                            console.log("Obj String: "+JSON.stringify(data));
                            $scope.showSingleDetailPost(data);                            
                        }
                    });                    
                };
                
                $scope.showSingleDetailPost = function (postObj) {
                    $scope.$apply(function () {
                        //$scope.post = $window.mresults[index];
                        //var jsonContent = angular.fromJson($scope.post.content);
                        $scope.post.jsonContent = {};
                        $scope.post.jsonContent = postObj;
                        //hardCodeComments();
                    });
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };
                
//                var hardCodeComments = function () {
//                    $scope.post.comments = [
//                        {
//                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
//                            "content": {
//                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
//                                "image": "https://goo.gl/5Ryb1S"
//                            },
//                            "owner": {
//                                "_id": "5673f5848cba8c030083383e",
//                                "name": "Testcseapi Testcseapi",
//                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
//                            },
//                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
//                            "post": "5673fef5e49bca680973858f"
//
//                        },
//                        {
//                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
//                            "content": {
//                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
//                                "video": "https://voice-of.s3.amazonaws.com/post%2Fbig_buck_bunny_720p_1mb.mp4"
//                            },
//                            "owner": {
//                                "_id": "5673f5848cba8c030083383e",
//                                "name": "Testcseapi Testcseapi",
//                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
//                            },
//                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
//                            "post": 'ObjectId("566fc422bf78870f74438a90")'
//                        }
//                        ,
//                        {
//                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
//                            "content": {
//                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
//                            },
//                            "owner": {
//                                "_id": "5673f5848cba8c030083383e",
//                                "name": "Testcseapi Testcseapi",
//                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
//                            },
//                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
//                            "post": 'ObjectId("566fc422bf78870f74438a90")'
//                        }
//                    ];
//                };

            }]);