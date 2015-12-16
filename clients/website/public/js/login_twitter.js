
function doTwitterLogin(){
    ref.authWithOAuthPopup("twitter", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", JSON.stringify(authData));          
          $("#nickname").val(""+authData.twitter.displayName);
        }
      });
}



