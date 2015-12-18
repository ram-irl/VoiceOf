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
                    var url = "?lat="+location.lat+"&lng="+location.lng+"&rad="+($window.distanceRadius*1000);
                    api.getAllpost(url, function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            $window.mresults = data;

                            $window.rearrangeMarkers(location);

                        }
                    });
                };                
                
                $scope.showDetailPost = function (index) {                    
                    $scope.$apply(function () {
                        $scope.post = $window.mresults[index];
                        hardCodeComments();
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
//                    console.log($files);
//                    $scope.policy = 'eyJleHBpcmF0aW9uIjoiMjAxNS0xMi0xOFQwODo1NDozMy41NjJaIiwiY29uZGl0aW9ucyI6W1sic3RhcnRzLXdpdGgiLCIka2V5IiwidGVtcC8iXSx7ImJ1Y2tldCI6InZvaWNlLW9mIn0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9LFsic3RhcnRzLXdpdGgiLCIkQ29udGVudC1UeXBlIiwiaW1hZ2UvanBlZyJdLHsic3VjY2Vzc19hY3Rpb25fc3RhdHVzIjoiMjAxIn1dfQ==';
//                    $scope.signature = 'cvcPuWOMZCAsCTlksFBF/PJ6haM=';
//                    $scope.keyId = 'AKIAJRBLOIR774SS6NIQ';
//                    $upload.upload({
//                        url: 'https://voice-of.s3.amazonaws.com/', //S3 upload url including bucket name
//                        method: 'POST',
//                        transformRequest: function (data, headersGetter) {
//                            var headers = headersGetter();
//                            delete headers['Authorization'];
//                            return data;
//                        },
//                        data: {
//                            key: 'temp/'+$scope.selFile.name, // the key to store the file on S3, could be file name or customized
//                            AWSAccessKeyId: $scope.keyId, //< YOUR AWS AccessKey Id >
//                            acl: 'public-read', // sets the access to the uploaded file in the bucket: private, public-read, ...
//                            policy: $scope.policy, // base64-encoded json policy (see article below)
//                            signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
//                            "Content-Type": $scope.selFile.type != '' ? $scope.selFile.type : 'application/octet-stream', // content type of the file (NotEmpty)
//                            filename: $scope.selFile.name // this is needed for Flash polyfill IE8-9
//                            
//                        },
//                        file: $scope.selFile,
//                    }).then(function (resp) {
//                        console.log('Success uploaded. Response: ' + resp.data);
//                    }, function (resp) {
//                        console.log('Error status: ' + resp.status);
//                    }, function (evt) {
//                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//                        console.log('progress: ' + progressPercentage );
//                    });

//                    var file = $files[0];
//                    var upload = $upload.upload({
//                        url: "https://voice-of.s3.amazonaws.com/",
//                        method: "POST",
//                        transformRequest: function (data, headersGetter) {
//                            var headers = headersGetter();
//                            delete headers['Authorization'];
//                            return data;
//                        },
//                        data: {
//                            'key': "temp/" + file.name,
//                            'acl': 'public-read',
//                            'Content-Type': file.type,
//                            'AWSAccessKeyId': "AKIAJRBLOIR774SS6NIQ",
//                            'success_action_status': '201',
//                            'Policy': "eyJleHBpcmF0aW9uIjoiMjAxNS0xMi0xOFQxMjowOTozNS41NDJaIiwiY29uZGl0aW9ucyI6W1sic3RhcnRzLXdpdGgiLCIka2V5IiwidGVtcC8iXSx7ImJ1Y2tldCI6InZvaWNlLW9mIn0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9LFsic3RhcnRzLXdpdGgiLCIkQ29udGVudC1UeXBlIiwiaW1hZ2UvanBlZyJdLHsic3VjY2Vzc19hY3Rpb25fc3RhdHVzIjoiMjAxIn1dfQ==",
//                            'Signature': "JoAqHxc6toPUSYrgR53+w08+VkQ="
//                        },
//                        file: file
//                    });
                };

                //Submit post
                $scope.postSubmit = function () {
                    if ($scope.validLocation) {
                        var jsonData = {content: $scope.txtMessage, position: [$scope.resultLat, $scope.resultLan]};
                    } else {
                        var jsonData = {content: $scope.txtMessage, position: [currentLocation.lat, currentLocation.lng]};
                    }

                    api.submitPost(jsonData, function (err, data) {
                        console.log(err+" "+data);
                    });
                };
                
                
                var hardCodeComments = function () {
                    $scope.post.comments = [
                        {
                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
                            "content": {
                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
                                "image": ["https://goo.gl/5Ryb1S"]
                            },
                            "owner": {
                                "_id": "5673f5848cba8c030083383e",
                                "name": "Testcseapi Testcseapi",
                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
                            },
                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
                            "post": "5673fef5e49bca680973858f"
                        },
                        {
                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
                            "content": {
                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
                                "video": ["http://goo.gl/GWDzxF"]
                            },
                            "owner": {
                                "_id": "5673f5848cba8c030083383e",
                                "name": "Testcseapi Testcseapi",
                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
                            },
                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
                            "post": 'ObjectId("566fc422bf78870f74438a90")'
                        }
                        ,
                        {
                            "_id": 'ObjectId("566fc4d4bf78870f74438a96")',
                            "content": {
                                "msg": "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                            },
                            "owner": {
                                "_id": "5673f5848cba8c030083383e",
                                "name": "Testcseapi Testcseapi",
                                "picture": "https://scontent.xx.fbcdn.net/hprofile-xlt1/v/t1.0-1/p50x50/11218939_398520093664578_738865213469592085_n.jpg?oh=2b6007b9e8ca4d11a1256e4db45a587b&oe=570BEA6F"
                            },
                            "created": 'ISODate("2015-12-15T07:45:38.744Z")',
                            "post": 'ObjectId("566fc422bf78870f74438a90")'
                        }
                    ];
                };
            
            }]);