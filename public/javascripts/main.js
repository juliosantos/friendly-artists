var FriendlySongs = (function () {
  var GRAPH_API_URL = "https://graph.facebook.com";
  var accessToken = "AAACEdEose0cBAPXZBd1lhUITDy3ZBKvzTcrnVwh4bUVfAMEVsFOF35ZAQiFZC8P0onyU8RgjqEYVxPvsOmDIM8sp60JCYSeOAZAMWuDPZC9gZDZD";

  var friends = [];
  var artists = [];

  var Progress = function (options) {
    this.counter = 0;
    this.upperBound = options.upperBound;
    this.completed = false;
    this.bar = $( "#" + options.barID ).children().first();
  };
  Progress.prototype.increment = function () {
    this.counter++;
    if (this.bar != undefined) {
      this.bar.width( this.percent() );
    }
    if (this.counter >= this.upperBound) {
      this.complete();
    }
  };
  Progress.prototype.percent = function () {
    return this.counter * 100 / this.upperBound + "%"
  };
  Progress.prototype.complete = function () {
    this.completed = true;
    if (this.bar != undefined) {
      this.bar.width( "100%" );
      var that = this;
      setTimeout( function () {
        that.bar.addClass( "bar-success" );
        that.bar.parent().removeClass( "active" );
        that.bar.parent().removeClass( "progress-striped" );
      }, 500 );
    }
  }

  var friendsProgress;
  var probingProgress;
  var songProgress;

  var getSongs = function (user_id, deferred) {
    $.post( GRAPH_API_URL, {
      access_token : accessToken,
      batch : JSON.stringify( [
        { "method" : "GET", "name" : "xxx", "relative_url" : user_id + "/music.listens?limit=300" },
        { "method" : "GET", "relative_url" : "?ids={result=xxx:$.data..song.id}&fields=data" }
      ] )
    }, function (response) {
      artists.push( _.uniq( jsonPath( JSON.parse( JSON.parse(response)[1]["body"] ), "$..musician[0][name]" ) ) );
    }).complete( function () {
      songProgress.increment();
      if (songProgress.completed) {
        deferred.resolve();
      }
    });
  };

  var probeSongs = function () {
    var deferred = $.Deferred();

    var friendsInGroups = _.map( _.inGroupsOf( _.pluck( friends, "id" ), 50 ), function (a) { return _.compact(a) } )

    probingProgress = new Progress( {upperBound : friendsInGroups.length, barID : "progress-probing"} );
    
    _.each( friendsInGroups, function (friends_ids, groupIndex) {
      var batch = _.map( friends_ids, function (friend_id) {
        return { "method" : "GET", "relative_url" : friend_id + "/music.listens?limit=1" }
      });
      $.post( GRAPH_API_URL, {
        access_token : accessToken,
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

  var getFriends = function () {
    var deferred = $.Deferred();

    friendsProgress = new Progress( {upperBound : 1, barID : "progress-friends"} );
    $.getJSON( GRAPH_API_URL + "/me/friends", { access_token : accessToken }, function (response) {
      friends = response.data;
      friendsProgress.complete();
      deferred.resolve();
    }).error( function () {
      deferred.reject();
    });

    return deferred;
  };

  var friendsWithSongs = function () { return _.filter( friends, function (friend) { return friend.hasSongs; } ) };

  var init = function () {
    $( "#button" ).find( "button" ).click( function () {
      var deferred = Facebook.authenticate();
      var $button = $( this );

      $button.button( "loading" );

      deferred.done( function () {
        $( "#login-modal" ).modal( "hide" );
        $button.slideUp();
        $( "#progress" ).slideDown();
        start();
      });

      deferred.fail( function () {
        $button.button( "repeat" );
      });

      e.preventDefault();
    });
  };

  var start = function () {
    var deferred = $.Deferred();
    var chain = deferred;

    chain = chain.pipe( getFriends );

    chain = chain.pipe( probeSongs );

    chain = chain.pipe( function () {
      var d = $.Deferred();
      songProgress = new Progress( {upperBound : friendsWithSongs().length, barID : "progress-songs"} );
      _.each( friendsWithSongs(), function (friend) {
        getSongs( friend.id, d );
      });
      return d;
    });

    chain.done( function () {
      artists = _.sortBy( _.groupBy( _.flatten(artists), function (artist) { return artist; } ), function (group) { return group.length; }).reverse();
      fillTable();
    });

    deferred.resolve();
  };

  var fillTable = function () {
    var artistRowTemplate = $( "#artist-row" ).html();
    var $table = $( "table#artist-count" );
    var $tbody = $table.children( "tbody" );
    _.each( artists, function (artist) {
      var tr = _.template( artistRowTemplate, {
        name : artist[0],
        count : artist.length
      });
      $tbody.append( tr );
    });

    $( "#progress" ).slideUp( 600 );
    $( "#results" ).show();
  };

  _.mixin({
    inGroupsOf: function(array, number, fillWith) {
        fillWith = fillWith || null;
        var index = -number, slices = [];

        if (number < 1) return array;

        while ((index += number) < array.length) {
            var s = array.slice(index, index + number);
            while(s.length < number)
                s.push(fillWith);
            slices.push(s);
        }
        return slices;
    }
  });

  return {
    init : init
  }
}());
