angular.module("voiceOf.controllers")
        .controller('MasterController', ['$scope', '$rootScope', 'api', '$upload', function ($scope, $rootScope, api, $upload)
            {
                //selected file in scope
                $scope.selFile = null;
                //Check it is a valid location
                $scope.validLocation = null;
                //Show command for specific post
                $scope.showDetailPost = function () {
                    $('#postDetails').modal();                      // initialized with defaults
                    $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
                    $('#postDetails').modal('show');
                };
                $scope.checkLocationAvailable = function () {
                    api.checkLocationAvailable(function (err, data) {
                        if (data.results.length == 0) {
                            $scope.validLocation = false;
                        } else {
                            $scope.validLocation = true;
                        }
                        console.log(data.results.length);
                    });
                };
                //Select artifact
                $scope.selectArtifact = function () {
                    angular.element("#artifact_upload").click();
                };
                //Keep selected file
                $scope.fileSelected = function ($files, errFiles) {
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
                };
            }]);