if (window.location.protocol != "https:" && window.location.host.indexOf("localhost") < 0)
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);



var MobileServiceClient = WindowsAzure.MobileServiceClient;
var client = new MobileServiceClient('https://chillana-app.azure-mobile.net/', 'CHRFiNaoLZUdUYfCIFIHUVpoiIGOkC10');
var messageTable = client.getTable('message?lng=1&lat=1');
var userTable = client.getTable('user');
var currentLocation = null;
var userLocation = null;
var isMobile = (/Mobile/i.test(navigator.userAgent));
var infobox;
var infoboxCharsizelimit = 20;
var showMapinMobile = false;
var markers = [];
var distanceRadius = 1000; // default is 1000 in meters
var sharedID = "";

//Submits the user information(nickname and phone number) information to the message table 
$(function () {
    $("#submitUser").click(function () {
        submitUserInfo();
    });
});

function submitUserInfo() {
//    if (isMobile) {
//        return;//disabled
//    }
    if ($("#nickname").val().length > 0) {
        if (!nickNameValidation($("#nickname").val())) {
            return;
        }
        if ($("#pnumber").val().length > 0 && !phonenumber_validation($("#pnumber").val())) {
            return;
        }

        setCookie("nickname", $("#nickname").val());
        setCookie("pnumber", $("#pnumber").val());
        console.log(getCookie("nickname") + " | " + getCookie("pnumber"));

        userTable.insert({
            nickname: $("#nickname").val(),
            pnumber: $("#pnumber").val()
        }).done(function (result) {
            $('#welcomContent').text("hello " + getCookie("nickname"));
            $('#customerInfo').modal('hide'); // initializes and invokes show immediately
        }, function (err) {
            console.log(err);
        });
    } else {
        alert("Please fill the form ");
    }
    ga('send', 'event', 'Sign In', 'click', 'Start Now');
}
////

//Submits the message and other information to the message table 
$(function () {
    $("#submitMsg").click(function () {
        submitUserPost();
    });
});
$(function () {
    $("#txtMsg").keypress(function (e) {
        if (e.which === 13) {
            submitUserPost();
        }
    });
});
function submitUserPost() {
    if ($("#txtMsg").val().length > 0 && getCookie("nickname").length > 0) {
        if ($("#txtMsg").val().length > 250) { // checking the message text length
            alert('message too long');
            return;
        }

        /////////////

        $.ajax({
            method: "GET",
            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + $("#addressMsg").val() + "&key=AIzaSyBTznaZuJw6VKOEACAZENeAabe1MGswaEM",
        })
                .done(function (msg) {
                    //console.log(msg.results[0].geometry.location.lat + "|" + msg.results[0].geometry.location.lng);
                    //console.log(msg.results.length);

                    if (msg.results.length == 0)
                    {
                        alert("Can't find the address")
                        return;
                    }

                    messageTable.insert({
                        message: $("#txtMsg").val(),
                        sentOn: new Date(),
                        lat: msg.results[0].geometry.location.lat,
                        lng: msg.results[0].geometry.location.lng,
                        address: $("#addressMsg").val(),
                        name: getCookie("nickname")
                    }).done(function (result) {

                        //ram: send socket updates here...        
                        //ram: disabled it ..
                        //location.reload();

                        alert("Your shout tweeted!");
                        $("#addressMsg").val("");
                        $("#txtMsg").val("");

                        currentLocation = {lat: msg.results[0].geometry.location.lat, lng: msg.results[0].geometry.location.lng};
                        map.setCenter(currentLocation);

                    }, function (err) {
                        console.log(err);
                    });
                });


        /////////////
    }
    else
    {
        alert("Please Enter Message");
    }

    ga('send', 'event', 'Post', 'click', 'Post Message');
}

function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}
//Retrieves cookie value from the given key name
//ram: ?? need explanation
function getCookie(cname) {
    var keyValue = document.cookie.match('(^|;) ?' + cname + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function phonenumber_validation(inputtxt)
{
    var phoneno = /^\d{10}$/;
    if (inputtxt.match(phoneno))
    {
        return true;
    } else
    {
        alert("Its not a 10 digit number");
        return true;
    }
}

function nickNameValidation(inputtxt)
{
    if (inputtxt.length <= 20)
    {
        return true;
    } else
    {
        alert("Please enter smaller name");
        return false;
    }
}


//section 2 variable declaration
var map;
var customLocation;
var infowindow;
var marker;
var userMarkerImage;
var clientMarkerImage; //current location marker image
var mytimeOut; //map changing stuff..
var distanceCovered = 20000; //20 km
var markerArray, markerInfoWindowArray; // markerinfo --> bubble. 
var userGeoFence; // circle.. 
var mresults;

function initMap() {
    //first pop up that comes..proceed to chillana.in .. 
    if (isMobile) {
        if (!showMapinMobile) {
            return;//disabled 
        }
    }

    var defaultZoom = 11;
    if (isMobile)
        defaultZoom = 10;

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 13.052723550149544, lng: 80.189208984375}, //chennai location,
        zoom: defaultZoom,
        disableDefaultUI: true
    });
    map.setOptions({ maxZoom: 20, minZoom: 4 });

    userMarkerImage = {url: "img/markers/user_marker_icon.png",
        scaledSize: new google.maps.Size(32, 32)
    };
    clientMarkerImage = {url: "img/markers/client_marker_pin.png",
        scaledSize: new google.maps.Size(32, 32)
    };


    marker = new google.maps.Marker();
    infowindow = new google.maps.InfoWindow();

    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });

    infobox = new InfoBox({
        content: "",
        disableAutoPan: false,
        maxWidth: 150,
        pixelOffset: new google.maps.Size(-92, -100),
        zIndex: null,
        closeBoxMargin: "-10px 2px 2px 2px",
        closeBoxURL: "../img/close-icon.png",
        infoBoxClearance: new google.maps.Size(1, 1)
    });

//    //Center Changed: {"lat":12.905130058903858,"lng":80.20777717680016}
//    map.addListener('center_changed', function () {
//
//        setTimeout(function () {
//            try {
//                var mylocation = map.getCenter();
//                obj = JSON.parse(JSON.stringify(mylocation));
//                //alert(obj.lat);
//                var mylocationValues = {
//                    lat: obj.lat,
//                    lng: obj.lng
//                };
//
//                callRefreshAPi(mylocationValues);
//
//            } catch (e) {
//                console.log(e);
//            }
//        }, 100);
//    });

    //ram: need to see if initGPS is required
    initGPS();
    addMapPositionChangeListener();
}

// add map position change listener - to get distance from center location to map corner
function addMapPositionChangeListener() {
    google.maps.event.addListener(map, 'idle', function (ev) {
        try {
            var bounds = map.getBounds();
            var ne = bounds.getNorthEast(); // LatLng of the north-east corner
            var sw = bounds.getSouthWest(); // LatLng of the south-west corder
            var nw = new google.maps.LatLng(ne.lat(), sw.lng());
            var se = new google.maps.LatLng(sw.lat(), ne.lng());

            var northeast = new google.maps.LatLng(ne.lat(), ne.lng(), false);
            var southwest = new google.maps.LatLng(sw.lat(), sw.lng(), false);
            var northwest = new google.maps.LatLng(nw.lat(), nw.lng(), false);
            var southeast = new google.maps.LatLng(se.lat(), se.lng(), false);

            var mapcenter = new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng(), false);

            var ned = google.maps.geometry.spherical.computeDistanceBetween(mapcenter, northeast);
            var swd = google.maps.geometry.spherical.computeDistanceBetween(mapcenter, southwest);
            var ned = google.maps.geometry.spherical.computeDistanceBetween(mapcenter, northwest);
            var sed = google.maps.geometry.spherical.computeDistanceBetween(mapcenter, southeast);

            distanceRadius = Math.max(ned, swd, ned, sed);

//            console.log("distance: " + distanceRadius);
//            console.log("North East: "+northeast);
//            console.log("zoom :"+map.zoom);            

//            clearCircle();
            //drawCircle(northeast);
//            drawCircle(mapcenter);

            try {
                callRefreshAPi(getMapCenterLocation());
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    });
}

    
    // get map center position - lat and lng
function getMapCenterLocation() {
//    var mylocation = map.getCenter();
    var mylocation = new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng(), false);
    var mylocationValues = {
        lat: mylocation.lat(),
        lng: mylocation.lng()
    };
    return mylocationValues;
}


//
function initGPS() {
    if (isMobile) {
        currentLocation = {lat: 13.052723550149544, lng: 80.189208984375};//chennai location
        callRefreshAPi(currentLocation);
        return;
    }

    if (navigator.geolocation) {
        //ram: to verify
        if (currentLocation === null) {
            currentLocation = {lat: 13.052723550149544, lng: 80.189208984375};//chennai location
            map.setCenter(currentLocation);
        }

        //ram: ram changed it .. watch out for this. 
        //navigator.geolocation.watchPosition(function (position) {
        navigator.geolocation.getCurrentPosition(function (position) {

            //ram:need to check the validity of === 
            if (position === null)
            {
                console.log("position is null in 234 .. please note..");
                return;
            }

            //ram: clearwatch should be used.. instead of just returning
            if (currentLocation != null) {
                console.log("current location not null in 240");
            }

            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            userLocation = currentLocation;

            map.setCenter(currentLocation);
            callRefreshAPi(currentLocation);

            var userMarker = new google.maps.Marker({
                position: currentLocation,
                map: map,
                title: 'Your Current Location'
                        //icon: userMarkerImage
            });
            markers.push(userMarker);

            userMarker.addListener('click', function () {
                try {
                    infobox.setContent('<div><br><p style="top:25%; font-size:14px; text-align:center;">Your current location</p></div>');
                    infobox.open(map, userMarker);
                    ga('send', 'event', 'Map Pin', 'click', 'User Pin');
                } catch (e) {
                    //console.log(e);
                }
            });
        }, function (error) {
            if (error.code === error.PERMISSION_DENIED)
            {
                alert("GPS access denied. Please enable the GPS and give access to Chillana.");
            }
            else
            {
                alert("error in access your location");
            }
        });
    }
    else
    {
        alert('error in finding your location');
    }
}
function callRefreshAPi(location) {
    angular.element(document.getElementById('MasterTag')).scope().refreshPins(location);
//    var api = "message?lat=" + location.lat + "&lng=" + location.lng + "&dis=" + distanceRadius/1000;
//    client.invokeApi(api, {
//        body: null,
//        method: "get"
//    }).done(function (results) {
//
//        //alert(JSON.stringify(results));
//        mresults = null;
//        mresults = results.result;
//
//        rearrangeMarkers(location);
//
//    }, function (error) {
//        console.log(error.message);
//    });
}
function rearrangeMarkers(location) {
    removeMarkers();
    removeMarkerInfoWindow();
    if (mresults != null && mresults.length >= 0) {
        //clearCircle();
        //drawCircle(location);
//        removeMarkers();
//        removeMarkerInfoWindow();

        //ram:efficient reuse possible.
        markerArray = new Array();
        markerInfoWindowArray = new Array();
    }

    for (var i = 0; i < mresults.length; i++) {
//        var infobox = new InfoBox({
//            content: "",
//            disableAutoPan: true,
//            maxWidth: 150,
//            pixelOffset: new google.maps.Size(-92, -100),
//            zIndex: null,
//            closeBoxMargin: "-10px 2px 2px 2px",
//            closeBoxURL: "../img/close-icon.png",
//            infoBoxClearance: new google.maps.Size(1, 1)
//        });

        //ram:for needs to be changed as foreach.
        var result = mresults[i];

        var marker = new google.maps.Marker({
            position: {
                lat: result.position.coordinates[1],
                lng: result.position.coordinates[0]
            },
            map: map,
            title: '',
            icon: clientMarkerImage
        });


//        var concatmessage = "" + result.message;
//        concatmessage = (concatmessage.length > infoboxCharsizelimit) ? concatmessage.substring(0, infoboxCharsizelimit) : concatmessage;
//        var contentString = "<div onclick='showContentDetail(\"" + i + "\")' class=\"info-map-container\">" + "<strong> # " + result.name + "</strong><p class=\"info-map-content\">" + concatmessage + "</p></div>";
//        infobox.setContent(contentString);

        //ram:could be better.. not a deal breaker.
        // Push your newly created marker into the array:
        markerArray.push(marker);
        markerInfoWindowArray.push(infobox);

        //Attach click event to the marker.
        (function (marker, result) {
            google.maps.event.addListener(marker, "click", function (e) {                
                ga('send', 'event', 'Map Pin', 'click', 'Show Detail');

                //ram:reuse the below few lines.. it's repeated one more time before.
//                var concatmessage = "" + result.message;
                var index = mresults.indexOf(result);
                
                if(index<0)return;
                angular.element(document.getElementById('MasterTag')).scope().showDetailPost(index);
//                concatmessage = (concatmessage.length > infoboxCharsizelimit) ? concatmessage.substring(0, infoboxCharsizelimit) : concatmessage;
//                var contentString = "<div onclick='showContentDetail(\"" + index + "\")' class=\"info-map-container\">" + "<strong> # " + result.author + "</strong><p class=\"info-map-content\">" + result.content + "</p></div>";
//
//                try {
//                    infobox.setContent(contentString);
//                    infobox.open(map, marker);
//                } catch (e) {
//                    alert(e);
//                }

                showContentDetailWithObj(result);
                // $("#clientName").text("" + result.name);//phone
                // $("#clientContactNumber").text("" + result.phone);
                // $("#clientReqDescription").text("" + result.message);
                // $("#clientDistance").text("" + (result.distance / 1000).toFixed(2) + " KM");
            });
        })(marker, result);
    }
    
}

function drawCircle(location) {
    userGeoFence = new google.maps.Circle({
        strokeColor: '#EF5E39',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#EF5E39',
        fillOpacity: 0.15,
        map: map,
        center: location,
        radius: distanceCovered //5km
    });
}
function clearCircle() {
    if (userGeoFence) {
        userGeoFence.setMap(null);
    }
}
function removeMarkers() {
    try {
//        ram:not sure why the below commented code is
        if (markerArray != null) {
            for (i = 0; i < markerArray.length; i++) {
                markerArray[i].setMap(null);
            }
        }
        markerArray.length = 0;
        markerArray = null;
    } catch (e) {
    }
}

function removeMarkerInfoWindow() {
    try {
        //ram:not sure why the below commented code is
        if (markerInfoWindowArray != null) {
            for (i = 0; i < markerInfoWindowArray.length; i++) {
                markerInfoWindowArray[i].setMap(null);
            }
        }
        markerInfoWindowArray.length = 0;
        markerInfoWindowArray = null;
    } catch (e) {
    }
}

//Focus to current location 
function focusCurrentLocation() {
    if (currentLocation != null) {
        map.setCenter(currentLocation);
        console.log(currentLocation);
    } else {
        // Waiting for the location
        console.log("current location clicked and returned null");
    }
    ga('send', 'event', 'Location', 'click', 'Show my Location');
}

// check customer new or old. get information for new customer.
$(window).load(function () {

    $("#apploader").hide();
    //checkDeviceType();
//    var osName = getMobileOperatingSystem();
    showMapinMobile = true;
//    if (osName === "ios") {
//        //redirect to ios page        
////        showDetectOSInfo();
////        showiOSHtmlContent();
////        $('#welcomContent').text("Chillana - Shout your tweet");
////        return;
//    } 
//    else if (osName === "Android") {
//        showMapinMobile = true;        
////        //redirect to Android page
////        showDetectOSInfo();
////        showAndroidHtmlContent();
////        $('#welcomContent').text("Chillana - Shout your tweet");
////        return;
//    }
    /*if (getCookie("nickname") && getCookie("nickname").length > 0) {
        $('#welcomContent').text("Hello, " + getCookie("nickname"));
        //user already login
        $('#customerInfo').modal('hide');               // initializes and invokes show immediately
        //console.log("User already exist");
    } else {
        //user not already login
        //console.log("New user");
        $('#customerInfo').modal();                      // initialized with defaults
        $('#customerInfo').modal({keyboard: false});   // initialized with no keyboard
        $('#customerInfo').modal('show');                // initializes and invokes show immediately
    }*/

    //copy link is not working in safari .. hence disabled it.
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    if (isSafari) {
        document.getElementById('copyurl').style.display = 'none';
    }
});

function showAboutInfo() {
    $('#aboutApp').modal();                      // initialized with defaults
    $('#aboutApp').modal({keyboard: false});   // initialized with no keyboard
    $('#aboutApp').modal('show');
    ga('send', 'event', 'Info', 'click', 'View');
}

function checkDeviceType() {
    if (!isMobile) {
        document.getElementById('whatsapp').style.display = 'none';
    } else {
        document.getElementById('copyurl').style.display = 'none';
    }
}
function showDetectOSInfo() {
    $('#chooseOSpopup').modal();                      // initialized with defaults
    $('#chooseOSpopup').modal({keyboard: false});   // initialized with no keyboard
    $('#chooseOSpopup').modal('show');
    ga('send', 'event', 'Detect OS', 'show', 'View');
}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
        //iOS
        return "ios";
    } else if (userAgent.match(/Android/i)) {
        //Android
        return "Android";
    } else {
        // Unknown OS
        return "unknown";
    }
}

function showiOSHtmlContent() {
    // var ios_app_store_url = "https://itunes.apple.com/lc/app/ultra-board/id1033306895?mt=8";
    var content = '';
    //content+='<button onclick="doDownloadApp(\''+ios_app_store_url+'\')" type="button" class="btn btn-default">Download iOS App</button>';
    content += '<div align="center" class="logo-tag">';
    content += '<img src="img/logo.png"/><br>';
    content += '<br>';
    content += '<button onclick="hideMobilePopup();" type="button" class="btn btn-danger">Proceed to Chillana.in</button>';
    document.getElementById("chooseOSContent").innerHTML = content;
}

function showAndroidHtmlContent() {
    try {
        var android_play_store_url = "https://play.google.com/store/apps/details?id=com.calicom.ultraboard&hl=en";
        var content = '';
        /*
         content += '<div align="center" class="logo-tag">';
         content += '<img src="img/logo.png"/><br>';
         content += '<p align="center" style="line-height: 1.5;">Shout your tweet by downloading Chillana App from Play Store</p>';
         content += '<button type="button" onclick=\'doDownloadApp(\"' + android_play_store_url + '\")\' class="btn btn-danger">Download Chillana App</button><br/><br/>';
         content += '<button onclick="hideMobilePopup();" type="button" class="btn btn-primary">Proceed to Chillana.in</button>';
         */
        content += '<div align="center" class="logo-tag">';
        content += '<img src="img/logo.png"/><br>';
        content += '<br>';
        content += '<button onclick="hideMobilePopup();" type="button" class="btn btn-danger">Proceed to Chillana.in</button>';
        //content = "";
        //content+="<input type=\"button\" size=\"20\" onclick=\"location.href='http://google.com';\" class=\"btn btn-default\" value=\"Go to Google\" />";
        //alert(content);
        document.getElementById("chooseOSContent").innerHTML = content;
        //alert(document.getElementById("chooseOSContent").innerHTML);
    } catch (e) {
        console.log(e);
    }
}

function doDownloadApp(linkURL) {
    try {
        window.location.href = linkURL;
    } catch (e) {
        //console.log(e);
    }
}

// show user posted message when click on the marker
function showContentDetailWithObj(post) {
    try {
        //alert(JSON.stringify(post));
        if (!post)
            return;
        var contentString = "<strong class=\"nick-name\">" + post.name + "</strong> <br><p class=\"typ-message\">" + post.message + "</p>";
        $("#detailBoxContent").html(contentString);
        //$("#detailbox").show();
        $("#detailbox").removeClass('disable');
        $("#detailbox").addClass('enable');
    } catch (e) {
        console.log("showContentDetailWithObj Error: " + e);
    }
}

function showContentDetail(index) {
    try {
        var post = mresults[index];

        var contentString = "<strong class=\"nick-name\">" + post.name + "</strong> <br><p class=\"typ-message\">" + post.message + "</p>";
        $("#detailBoxContent").html(contentString);
//      $("#detailbox").show();
        $("#detailbox").removeClass('disable');
        $("#detailbox").addClass('enable');
    } catch (e) {
        console.log("showContentDetail Error: " + e);
    }
}

// hide user posted messag
function hideContentDetail() {
    $("#detailbox").addClass('disable');
    $("#detailbox").removeClass('enable');
}

function hideMobilePopup() {

    showMapinMobile = true;
    //first time the map is init-ed after the proceed to chillana.in
    initMap();

    $('#chooseOSpopup').modal('hide');
}

function copyToClipboard() {
    var shareUrl = "https://chillana.in";

    // Create a "hidden" input
    var aux = document.createElement("input");

    // Assign it the value of the specified element
    aux.setAttribute("value", shareUrl);

    // Append it to the body
    document.body.appendChild(aux);

    // Highlight its content
    aux.select();

    // Copy the highlighted text
    document.execCommand("copy");

    // Remove it from the body
    document.body.removeChild(aux);

    $("#copyurl").tooltip('show');
    setTimeout(function () {
        $("#copyurl").tooltip('destroy');
    }, 1000);
    ga('send', 'event', 'Copy Link', 'click', 'Copied');
}