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
                url: CONSTANTS.API_URL + path,
                headers: CONSTANTS.API_HEADERS,
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
        service.getAllpost = function (callback) {
//            this.httpRequest("POST", "/users", null, function (err, data) {
//                if (err)
//                    callback(err, null);
//                else
//                    callback(null, data);
//            });

//Get datas from JSON file
//            $http.get('js/post.json').success(function (data) {
//                callback(null, data);
//            });
        };
        return service;
    }]);
