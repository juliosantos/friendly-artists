<!DOCTYPE html>
<html>
<head>
  <title>Friendly Artists</title>
  <meta charset="utf-8">
  <meta content="Júlio Santos" name="author">
  <link href="stylesheets/bootstrap.css" media="screen" rel="stylesheet" type="text/css" />
  <link href="stylesheets/main.css" media="screen" rel="stylesheet" type="text/css" />
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js" type="text/javascript"></script>
  <script src = "javascripts/bootstrap.min.js" type="text/javascript"></script>
  <script src = "javascripts/underscore-min.js" type="text/javascript"></script>
  <script src = "javascripts/json.js" type="text/javascript"></script>
  <script src = "javascripts/jsonpath.js" type="text/javascript"></script>
  <script src = "javascripts/main.js" type="text/javascript"></script>
</head>
<body>
  <div class="container">

    <div class="row">
        <div class="span9">
          <h1>Friendly Artists</h1>
        </div>
    </div>
    <div id="button" class="row">
      <div class="span9">
        <p>
          <button class="btn btn-large btn-primary" type="button">Go get 'em artists!</button>
        <p>
      </div>
    </div>

    <div id="progress" class="row">
        <div class="span9">
          <p>Fetching Facebook friends</p>
          <div id="progress-friends" class="progress progress-striped active">
            <div class="bar"></div>
          </div>
          <p>Probing friends for songs</p>
          <div id="progress-probing" class="progress progress-striped active">
            <div class="bar"></div>
          </div>
          <p>Getting friends' songs</p>
          <div id="progress-songs" class="progress progress-striped active">
            <div class="bar"></div>
          </div>
        </div>
    </div>

    <div id="results" class="row">
      <div class="span9">
        <table id="artist-count" class="table table-striped table-condensed">
          <thead>
            <tr>
              <th>Artist</th>
              <th># friends</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    </div>

  </div>


  <script id="artist-row", type="text/template">
    <tr>
      <td>
        <%= name %>
      </td>
      <td>
        <%= count %>
      </td>
    </tr>
  </script>

  <script>FriendlySongs.init();</script>
</body>
</html>