angular.module('voiceOf.factories').factory("api", ['$http', 'CONSTANTS', '$upload', function ($http, CONSTANTS, $upload) {
        var service = {};
        service.httpRequest = function (method, path, data, callback) {
//            if (http == null)
//                callback({
//                    error: true,
//                    errorCode: "HTTP_NULL"
//                }, null);
//            loadHeaders();
//            _apiHeaders['Content-Type'] = 'application/json';           
            $http({
                method: method,
                url: path,
                headers: {'Content-Type': 'application/json',
                    Authorization: 'VOICEOF-AUTH token="' + getCookie('userSessionToken') + '", AppId="WebsiteApp1"'
                },
                data: data
            }).success(function (data, status, headers, config) {
                if (data.error) {
                    callback(data, null);
                } else {
                    callback(null, data);
                }
            }).error(function (data, status, headers, config) {
                callback({
                    error: true,
                    errorCode: "UNKNOWN_ERROR"
                }, null);
                console.log(data, status, headers, config);
            });
        };

        //Google request
        service.googleRequest = function (method, path, callback) {
            $http({
                method: method,
                url: path
            }).success(function (data) {
                if (data.error) {
                    callback(data, null);
                } else {
                    callback(null, data);
                }
            }).error(function (data) {
                callback({
                    error: true,
                    errorCode: "UNKNOWN_ERROR"
                }, null);
            });
        };

        //Get all post
        service.getAllpost = function (url, callback) {
            this.httpRequest("GET", CONSTANTS.API_URL + "/posts/search" + url, null, function (err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        };

        //Submit post
        service.submitPost = function (values, file, callback) {
            if (file != null) {
                this.httpRequest("GET", CONSTANTS.API_URL + "/s3/policy?folder=post&type=" + file.type, null, function (err, policy) {
                    if (err) {
                        logger.error("Error in getting policy from AWS", "API,UPLOAD_ARTIFACT");
                        return;
                    }

                    var upload = $upload.upload({
                        url: "https://voice-of.s3.amazonaws.com/",
                        method: "POST",
                        transformRequest: function (data, headersGetter) {
                            var headers = headersGetter();
                            delete headers['Authorization'];
                            return data;
                        },
                        data: {
                            'key': "post/" + file.name,
                            'acl': 'public-read',
                            'Content-Type': file.type,
                            'AWSAccessKeyId': policy.AWSAccessKeyId,
                            'success_action_status': '201',
                            'Policy': policy.s3Policy,
                            'Signature': policy.s3Signature
                        },
                        file: file
                    }).then(function (resp) {
                        if (resp.status === 201) {
                            var data = xmlToJSON.parseString(resp.data, {childrenAsArray: false});
                            var location = data.PostResponse.Location["_text"];
                            if (file.type.indexOf('image') > -1) {
                                values.content.image = location;
                                console.log('imag');
                            } else {
                                console.log('video');
                                values.content.video = location;
                            }
                            service.httpRequest("PUT", CONSTANTS.API_URL + "/posts", values, function (err, data) {
                                if (err)
                                    callback(err, null);
                                else
                                    callback(null, data);
                            });
                        } else {
                            if (callback)
                                callback(resp, null);
                        }
                    }, function (resp) {
                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage);
                    });
                });
            } else {
                this.httpRequest("PUT", CONSTANTS.API_URL + "/posts", values, function (err, data) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, data);
                });
            }
        };

        service.checkLocationAvailable = function (callback) {
            this.googleRequest("GET", "https://maps.googleapis.com/maps/api/geocode/json?address=" + $("#addressMsg").val() + "&key=AIzaSyBTznaZuJw6VKOEACAZENeAabe1MGswaEM", function (err, data) {
                if (err)
                    callback(err, null);
                else
                    callback(null, data);
            });
        };

        service.postCommand = function () {
//            this.httpRequest("PUT", CONSTANTS.API_URL + "/posts", values, function (err, data) {
//                if (err)
//                    callback(err, null);
//                else
//                    callback(null, data);
//            });
        }

        return service;
    }]);
