angular.module('voiceOf.factories').factory("api", ['$http', 'CONSTANTS', function ($http, CONSTANTS) {
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
        service.getAllpost = function (callback) {
//            this.httpRequest("POST", "/users", null, null, function (err, data) {
//                if (err)
//                    callback(err, null);
//                else
//                    callback(null, data);
//            });
        };

        //Submit post
        service.submitPost = function (values) {
            this.httpRequest("POST", CONSTANTS.API_URL + "/posts", values, function (err, data) {
                if (err)
                    callback(err, null);
                else
                    callback(null, data);
            });
        };

        service.checkLocationAvailable = function (callback) {
            this.googleRequest("GET", "https://maps.googleapis.com/maps/api/geocode/json?address=" + $("#addressMsg").val() + "&key=AIzaSyBTznaZuJw6VKOEACAZENeAabe1MGswaEM", function (err, data) {
                if (err)
                    callback(err, null);
                else
                    callback(null, data);
            });
        };
        return service;
    }]);
