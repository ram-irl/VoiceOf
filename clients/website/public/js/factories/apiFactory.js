angular.module('voiceOf.factories').factory("api", ['$http', function ($http) {
        var service = {};
        service.getAllpost = function (callback) {
            $http.get('js/post.json').success(function (data) {
                callback(null, data);
            });
        };
        return service;
    }]);
