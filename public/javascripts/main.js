var FriendlyArtists = (function () {
  var depth = 1;

  var friendsProgress;
  var probingProgress;
  var songProgress;

  var init = function () {
    $( document ).ready( function () {
      $( document ).on( "facebook:ready", function () {
        
        $( "#controls" ).find( "form" ).slideDown();

        $( "form" ).submit( function (e) {
          var $button = $( "button" );
          var $input = $button.siblings( "input[type=text]" );

          $button.button( "loading" );
          $input.attr( "disabled", "disabled" );
          depth = parseInt( $input.val() );

          var deferred = Facebook.authenticate();

          deferred.done( function () {
            $( "#controls" ).find( "form" ).slideUp( function () {
              $("#intro").collapse("hide");
            });
            $( "#progress" ).slideDown();

            getFriends()
              .pipe( probeSongs )
              .pipe( fillAccordion )
              .pipe( getSongs )
              .done( function () {
                fillTable( );
              });
          });

          deferred.fail( function () {
            $button.button( "repeat" );
          });

          e.preventDefault();
        });
      });
    });
  };

  var getFriends = function () {
    var deferred = $.Deferred();

    friendsProgress = new Progress( {upperBound : 1, barID : "progress-friends"} );
    $.getJSON( Facebook.GRAPH_API_URL + "/me/friends", { access_token : Facebook.accessToken() }, function (response) {
      Friend.createFromFacebook( response.data );
      friendsProgress.complete();
      deferred.resolve();
    }).error( function () {
      deferred.reject();
    });

    return deferred;
  };


  var probeSongs = function () {
    var deferred = $.Deferred();

    var friendsInGroups = _.map( _.inGroupsOf( _.pluck( friends, "id" ), 50 ), function (a) { return _.compact(a) } )

    probingProgress = new Progress( {upperBound : friendsInGroups.length, barID : "progress-probing"} );
    
    _.each( friendsInGroups, function (friends_ids, groupIndex) {
      var batch = _.map( friends_ids, function (friend_id) {
        return { "method" : "GET", "relative_url" : friend_id + "/music.listens?limit=1" }
      });
      $.post( Facebook.GRAPH_API_URL, {
        access_token : Facebook.accessToken(),
        batch : JSON.stringify( batch )
      }, function (response) {
        _.each( JSON.parse( response ), function (friend_songs, index) {
          if (friend_songs != null) {
            var songs = JSON.parse( friend_songs["body"] ).data;
            if (songs.length > 0) {
              friends[groupIndex * 50 + index].hasSongs = true;
            }
          }
        });
      }).complete( function () {
        probingProgress.increment();
        if (probingProgress.completed) {
          deferred.resolve();
        }
      });
    });

    return deferred;
  };

  var getSongs = function () {
    var d = $.Deferred();

    songProgress = new Progress( {upperBound : Friend.withSongs().length * depth, barID : "progress-songs"} );
    _.each( Friend.withSongs(), function (friend) {
      getFriendSongs( friend.id, d, depth );
    });

    return d;
  };

  var getFriendSongs = function (user_id, deferred, depth) {
    var offset = 300 * (depth - 1);
    $.post( Facebook.GRAPH_API_URL, {
      access_token : Facebook.accessToken(),
      batch : JSON.stringify( [
        { "method" : "GET", "name" : "songs", "relative_url" : user_id + "/music.listens?limit=300&offset=" + offset },
        { "method" : "GET", "relative_url" : "?ids={result=songs:$.data..song.id}&fields=data" }
      ] )
    }, function (response) {
      var artists = jsonPath( JSON.parse( JSON.parse( response )[1]["body"] ), "$..musician[0][name]" );
      if (artists !== false ) {
        Friend.find( user_id ).addArtists( artists );
      }
    }).complete( function () {
      songProgress.increment();
      if (songProgress.completed) {
        deferred.resolve();
      }
      if (depth > 1) {
        getFriendSongs( user_id, deferred, depth - 1 );
      }
    });
  };

  var fillAccordion = function () {
    var friendDebugTemplate = $( "#friend-debug" ).html();
    var $p = $( "#friends-accordion" ).find( ".accordion-inner" ).children( "p" );
    var friendsWithSongs = _.sortBy( Friend.withSongs(), function (friend) { return friend.name });
    _.each( friendsWithSongs, function (friend, index) {
      var a = _.template( friendDebugTemplate, {
        id : friend.id,
        name : friend.name
      });
      $p.append( a );
      if (index + 1 < friendsWithSongs.length) {
        $p.append( "&nbsp;&middot;&nbsp;" );
      }
    });
    $( "#friends-accordion" ).slideDown( 600 ); 
  };

  var fillTable = function (sorted_artists) {
    var artists = _.map( friends, function (friend) { return friend.artists });
    var sorted_artists = _.sortBy( _.groupBy( _.flatten( artists ), function (artist) { return artist; } ), function (group) { return group.length; }).reverse();
    var artistRowTemplate = $( "#artist-row" ).html();
    var $table = $( "table#artist-count" );
    var $tbody = $table.children( "tbody" );
    _.each( sorted_artists, function (artist) {
      var friendNamesWithArtist = _.pluck( Friend.withArtist( artist[0] ), "name" );
      var tr = _.template( artistRowTemplate, {
        name : artist[0],
        count : artist.length,
        friends : friendNamesWithArtist.sort().join( ", " )
      });
      $tbody.append( tr );
    });
    $tbody.find( "a" ).tooltip( {placement : "right"} );

    $( "#progress" ).slideUp( 600, function () {
      $tbody.find( "a" ).first().tooltip( "toggle" );
    });
    $( ".accordion-body" ).collapse( "hide" );
    $( "#results" ).show();
  };

  return {
    init : init
  }
}());
