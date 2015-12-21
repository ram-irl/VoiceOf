//login_fb.js

// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    if(!getCookie('nickname') && !getCookie('userSessionToken')){
        myFacebookLogin();
        return;
    }
    else if(!getCookie('nickname')){
        getFBUserInfo();
        return;
    }
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        //hidefbmodalpopup();
        try{
        window.location.reload();
    }catch(e){alert(e);}
      // Logged into your app and Facebook.      
     // doProceedFbAuthAPI(JSON.stringify(response));
      //getFBUserInfo();
      
    } else if (response.status === 'not_authorized') {
      //myFacebookLogin();
      showfbmodalpopup();
    } else {
      //myFacebookLogin();
      showfbmodalpopup();
    }
  }
  
  function hidefbmodalpopup(){
       $('#customerInfo').modal();
      $('#customerInfo').modal('hide'); 
  }
  
  function showfbmodalpopup(){
      $('#customerInfo').modal();                      // initialized with defaults
     $('#customerInfo').modal({keyboard: false});   // initialized with no keyboard
     $('#customerInfo').modal('show');                // initializes and invokes show immediately
  }
  
  function checkLoginState() {
  console.log('checkLoginState called.... ');
    FB.getLoginStatus(function(response) {
    //getFBUserInfo();
    console.log("Test response: "+JSON.stringify(response));
      statusChangeCallback(response);
    });
     console.log('checkLoginState end.... ');
  }

  window.fbAsyncInit = function() {
  FB.init({
    //appId      : '727099750723457',//demo
    appId      : '964116050349573',//live
    oauth      : false,
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use version 2.2
  });

  /*FB.getLoginStatus(function(response) {      
    statusChangeCallback(response);     
  });*/
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  function getFBUserInfo() {
    //'id,name,public_profile,email,user_location,user_about_me,user_birthday,user_photos'
    FB.api('/me',{fields: 'id,name,email'}, function(response) {
        console.log("User info: "+JSON.stringify(response));
        try{
            setCookie("nickname",response.name);             
        }catch(e){console.log(e);}
    });
  }
  
  function myFacebookLogin() {      
    //FB.login(function(response){console.log("Test response: "+JSON.stringify(response));}, {scope: 'public_profile,email,user_location,user_about_me,user_birthday,user_photos'});
    FB.login(function(response){
       
        console.log("Test response: "+JSON.stringify(response));
        if(response.authResponse){
            doProceedFbAuthAPI(JSON.stringify(response));
            getFBUserInfo();
            hidefbmodalpopup();
        }
    }, {scope: 'email,public_profile,publish_actions'});
   }


function doProceedFbAuthAPI(paramString){

    var paramObject = JSON.parse(paramString);
    var params = JSON.stringify(paramObject.authResponse);
    
    $.ajax({ 
    url: "https://voiceof-api.herokuapp.com/auth/facebook",
    type: 'put',
    
    headers: {'Content-Type': 'application/json',              
                Authorization: 'VOICEOF-AUTH token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJrZXkiOiI2MzcyMTJmNTM0OTIwNWY5ZjJhMTQ1MDczM2YxNzkxMiIsInR5cGUiOiJhcHAiLCJhcHBJZCI6IldlYnNpdGVBcHAxIiwicGF5bG9hZEhhc2giOiIzNDQ5YzllNWUzMzJmMWRiYjgxNTA1Y2Q3MzlmYmYzZiJ9.wXmdshbFtD50CM6cDZMrm0MAndEUn_0FSgUSrmAXoU0", AppId="WebsiteApp1"'
            },
    data: params
    }).done(function (data, status, jqXHR) {
        //console.log("Full response:"+JSON.stringify(data));
        console.log("User token: "+JSON.parse(data).token);
        //var Location = data.getResponseHeader('Location');
        //console.log("Location: "+Location);
        setCookie('userSessionToken',JSON.parse(data).token);
        setCookie('userID', jqXHR.getResponseHeader('Location').replace('/users/',''));        
        callRefreshAPi(getCurrentLocation());
    }).fail(function (jqXHR, textStatus) {
        console.log(jqXHR);
        console.log(textStatus);
    });
}

function doFacebookLogin(){
    myFacebookLogin();  
    //getFBUserInfo();
}

