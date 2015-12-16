function doGooglePlusLogin(){
    ref.authWithOAuthPopup("google", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", JSON.stringify(authData));          
          $("#nickname").val(""+authData.google.displayName);
        }
      });
}