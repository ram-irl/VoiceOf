angular.module("voiceOf.controllers")
        .controller('MasterController', ['$scope', '$rootScope', 'api', '$upload', '$window', function ($scope, $rootScope, api, $upload, $window)
            {
                //selected file in scope
                $scope.selFile = null;
                //Check it is a valid location
                $scope.validLocation = null;
                //Show command for specific post
                
                $scope.nickname = "User";

                $scope.post = {};

                $scope.refreshPins = function (location) {
                    $scope.setUserName();                   
                    var url = "?lat=" + location.lat + "&lng=" + location.lng + "&rad=" + ($window.distanceRadius);
                    console.log(url);
                    api.getAllpost(url, function (err, data) {
                        if (err) {
                            console.log(err);
                            if($window.mresults)$window.mresults.length=0;
                            $window.rearrangeMarkers(location);
                        } else {
                            $window.mresults = data;
                            $window.rearrangeMarkers(location);                                                        
                        }
                    });
                };

                $scope.showDetailPost = function (index) {                    
                    showDetailPopup($window.mresults[index]._id);
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
                            $scope.refreshPins({lat: jsonData.position[1], lng: jsonData.position[0]});
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
                    var variable = "sharedurl";
                    var query = "";
                    query = "" + window.location;//hosted check
                    //query = "https://chillana.in/?sharedurl=5675109d37a24203000dc1b7";//local check
                    var vars = query.split("?");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair[0] == variable) {
                            sharedID = pair[1];
                        }
                    }
                    showDetailPopup(sharedID);
                };
                
                var showDetailPopup = function(postID){
                    if(!postID)return;
                    $("#apploader").show();
                    $scope.post._id=""; // reset to get new comments 
                    $scope.post.comments = [];
                    api.getPostByID(postID, function (err, data) {
                        $("#apploader").hide();
                        if (err) {
                            console.log(err);
                        } else {                                                        
                            $scope.showSingleDetailPost(data);                            
                        }
                    });
                };
                
                $scope.showSingleDetailPost = function (postObj) {
                    //$scope.$apply(function () {                        
                        $scope.post = postObj;
                        $scope.post.jsonContent = $scope.post.content;
                    //});
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };                

                angular.element(document).ready(function () {
                    $scope.openfbContent();
                });
                
                $scope.setUserName = function(){
                    var username = getCookie('nickname');                    
                    if(username){
                        $scope.nickname = username;
                    }else{
                        $scope.nickname = "User";
                    }                     
                };

            }]);