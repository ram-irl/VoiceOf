angular.module('voiceOf.factories').factory("api", ['$http', 'CONSTANTS', function ($http, CONSTANTS) {
        var service = {};
        service.httpRequest = function (method, path, header, data, callback) {
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
                headers: header,
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

        service.checkLocationAvailable = function (callback) {         
            this.httpRequest("GET", "https://maps.googleapis.com/maps/api/geocode/json?address=" + $("#addressMsg").val() + "&key=AIzaSyBTznaZuJw6VKOEACAZENeAabe1MGswaEM", null, null, function (err, data) {
                if (err)
                    callback(err, null);
                else
                    callback(null, data);
            });
        };
        return service;
    }]);
