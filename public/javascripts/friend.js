var friends = [];

var Friend = function (options) {
  this.id = options.id;
  this.name = options.name;
  this.hasSongs = false;
  this.artists = [];
  this.addArtists = function (artists) {
    this.artists = _.uniq( this.artists.concat( artists ) );
  };
};

Friend.createFromFacebook = function (response) {
  _.each( response, function (f) { friends.push( new Friend( f ) ) } );
};

Friend.find = function (id) {
  return _.select( friends, function(friend) { return friend.id == id })[0];
};

Friend.withSongs = function () {
  return _.filter( friends, function (friend) { return friend.hasSongs; } );
};

Friend.withArtist = function (artist) {
  return _.filter( friends, function (friend) { return _.include( friend.artists, artist ); } );
}
