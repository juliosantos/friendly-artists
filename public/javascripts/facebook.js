var Facebook = (function () {
  var GRAPH_API_URL = "https://graph.facebook.com";
  var accessToken;

  var facebookReady = function () {
    FB.init({
      appId      : "507512692596435", // App ID
      channelUrl : "http://friendlyartists.herokuapp.com/channel.html", // Channel File
      status     : false, // don't check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : false  // don't parse XFBML
    });
    $( document ).trigger( "facebook:ready" );
  };

  var authenticate = function () {
    var d = $.Deferred();

    FB.login( function( response ) {
      if ( response.authResponse && response.authResponse.accessToken ) {
        accessToken = response.authResponse.accessToken;
        d.resolve();
      } else {
        d.reject();
      }
    }, { scope: "friends_actions.music" } );    

    return d;
  };

  var getAccessToken = function () {
    return accessToken;
  };

  return {
    GRAPH_API_URL : GRAPH_API_URL,
    facebookReady : facebookReady,
    authenticate : authenticate,
    accessToken : getAccessToken
  }
}());
