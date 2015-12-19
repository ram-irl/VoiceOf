
voiceOf.directive('dynamicUrl', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            url: "=url"
        },
        controller: function($scope){
            $scope.getFileExtension = function(url) {url
                if(url && url!==null && url.length>0){                    
                    var dotIndex = url.lastIndexOf('.');
                    if(dotIndex<0)return "";
                    return url.substring(dotIndex+1);
                }                   
                else return "";
            };
        },
        link: function ($scope, element, $window) {
            //$scope.url = "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4";
            element.attr('src', $scope.url);
            console.log("url" + $scope.url);
            var ext = $scope.getFileExtension($scope.url).toLowerCase();
            element.attr('type', 'video/'+ext);
            console.log($scope.url + " " + ext);
        }
    };
});