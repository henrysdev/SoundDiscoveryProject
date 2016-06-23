angular.module('starter.controllers', [])


.controller('RecCtrl', function($scope, UserObject, Retrieve, Embed, StoredEmbedLinks, ProcessCollectionsObject) 
{
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'https://soundcloud.com/user-8492062'
  });
  var popularity_factor = 0;//0.455
  var max_artists_computed = 5;
  var max_recs_computed = 20;
  var max_tracks_per_rec = 1;
  $scope.StoredEmbedLinks = StoredEmbedLinks;
  $scope.UserObject = UserObject;
  $scope.input_suggestions = [];
  $scope.recommendedTracks = [];
  $scope.searchText = "";
  $scope.show_tracks = false;
  $scope.show_recs = false;
  $scope.show_suggestions = true;
  var avatarPath = "";

  $scope.weedOutTracks = function(track)
  {
    //if(track.favoritings_count == 0)
     // return false;
    if(track.duration > 960000)
      return false;
    var user_favorites = UserObject.get("favorites");
    for(var i = 0; i < user_favorites.length; i++)
    {
      if(track.id == user_favorites[i].id)
      {
        return false;
        break;
      }
    }
    return true;
  }

  $scope.embed = function(list_) 
  {
    var givenList = list_;
    var f = 0;
    for(var b = 0; b < givenList.length; b++)
    {
      var track_url = givenList[b].permalink_url;
      var myDataPromise = Embed.getData(track_url);
      myDataPromise.then(function(oEmbed){
      var id_ = givenList[f].id;
      f++;
      
      var html_orig = oEmbed.html;
      var htmlSplice = html_orig.split(" ");
      var refinedString = htmlSplice[5];
      refinedString = refinedString.substring(5,refinedString.length-11);
      var obj_to_store = {streamLink: refinedString, trackID:id_};
      StoredEmbedLinks.set(obj_to_store);
      if(f == givenList.length)
      {
        $scope.$apply(function () {
        $scope.recommendedTracks = list_;
        $scope.show_tracks = true;
        });
      }
      })
    }
  }

  $scope.getTopTracks = function(recs)
  {
    var recArtists = recs;
    var masterList = [];
    var p = 0;
    var i = 0;
    var max_tracks_local = max_tracks_per_rec;
    $scope.recommendedTracks = [];
    for(i = 0; i < max_recs_computed; i++)
    {
      var stringToPass = "/users/" + recArtists[i].permalink + "/tracks";
      //console.log(stringToPass);
      var myDataPromise = Retrieve.getData(stringToPass);
      myDataPromise.then(function(responseTracks)
      {  
        var miniTracklist = [];
        for(var n = 0; n < responseTracks.length; n++)
        {
          responseTracks[n].COMP_SCORE = 0;
          //responseTracks[n].favoritings_count;
          responseTracks[n].COMP_SCORE = (responseTracks[n].favoritings_count/responseTracks[n].playback_count);
          if($scope.weedOutTracks(responseTracks[n]) == true)
            miniTracklist.push(responseTracks[n]);
          //miniTracklist.push(responseTracks[n]);
        }
        miniTracklist.sort(function(a,b) {return (a.COMP_SCORE < b.COMP_SCORE) ? 1 : ((b.COMP_SCORE < a.COMP_SCORE) ? -1 : 0);} ); 
        if(miniTracklist.length > max_tracks_local)
        {
          miniTracklist.splice(max_tracks_local, (miniTracklist.length - max_tracks_local));
        }
        else
          max_tracks_local = miniTracklist.length;
        //masterList.push(miniTracklist);
        for(var l = 0; l < miniTracklist.length; l++)
          masterList.push(miniTracklist[l]);
        p++;
        if(p == max_recs_computed)
        {
          //console.log("HERES ALL THE RECOMMENDED TRACKS: ");
          masterList.sort(function(a,b) {return (a.COMP_SCORE < b.COMP_SCORE) ? 1 : ((b.COMP_SCORE < a.COMP_SCORE) ? -1 : 0);} ); 
          //console.log(masterList);
          var linkString = "";
          for(var t = 0; t < masterList.length; t++)
          {
            linkString += masterList[t].permalink_url;
            linkString += "\n";
          }
          //console.log(linkString);
          $scope.embed(masterList);
        }
        $scope.recommendedTracks = masterList;
        
      });
    }
  }
  
  $scope.combineAndCompare = function()
  {
    var allArtistsList = ProcessCollectionsObject.get("sec_gen_liked_artists");
    var masterList = [];

    for(var i = 0; i < allArtistsList.length; i++)
    {
      var currentArtist = allArtistsList[i];
      allArtistsList[i].FREQ = 1;
      allArtistsList[i].SCORE = 0;
      var result = findById(masterList, currentArtist.id);
      if(result != null)
      {
        result.FREQ++;
        result.SCORE = result.FREQ + (result.FREQ / result.followings_count);
      }
      else
      {
        masterList.push(allArtistsList[i]);
      }
    }
    masterList.sort(function(a,b) {return (a.FREQ < b.FREQ) ? 1 : ((b.FREQ < a.FREQ) ? -1 : 0);} ); 
    //console.log("HERE IT IS");
    //console.log(masterList);
    //console.log("ALL ARTIST MASTERLIST: ");
    //console.log(masterList);
    $scope.getTopTracks(masterList);
  }
  $scope.getListArtists = function()
  {
    var allFavoritesList = ProcessCollectionsObject.get("liked_artists_fav_lists");
    //console.log("users favorited artists favorited tracks: ");
    //console.log(allFavoritesList);
    var p = 0;
    var i = 0;
    var n = 0;
    var max_count = 0;
    var artistsListToPass = [];
    for(i = 0; i < allFavoritesList.length; i++)
    {
      for(n = 0; n < allFavoritesList[i].length; n++)
      {
        max_count++;
        var stringToPass = "/users/" + allFavoritesList[i][n].user_id;
        var myDataPromise = Retrieve.getData(stringToPass);
        myDataPromise.then(function(responseArtists)
        {  
          //console.log("retrieved: ");
          //console.log(responseArtists);
          p++;
          artistsListToPass.push(responseArtists);
          if(p == max_count)
          {
            ProcessCollectionsObject.set("sec_gen_liked_artists", artistsListToPass);
            $scope.combineAndCompare();
          }
        });
      }    
    }
  }

  $scope.getFavoritesLists = function()
  {
    //var artistsSaved = UserArtists.get();
    var artistsSaved = ProcessCollectionsObject.get("liked_artists");
    console.log(artistsSaved);
    if(artistsSaved.length > max_artists_computed)
    {
      artistsSaved.splice(max_artists_computed, (artistsSaved.length - max_artists_computed));
      //console.log(artistsSaved);
    }
    else
      max_artists_computed = artistsSaved.length;
    ProcessCollectionsObject.set("liked_artists", artistsSaved);
    artistsSaved = ProcessCollectionsObject.get("liked_artists");

    var favoritesLists = [];
    var p = 0;
    var i = 0;
    for(i = 0; i < max_artists_computed; i++)
    {
      var stringToPass = "/users/" + artistsSaved[i].id + "/favorites";
      var myDataPromise = Retrieve.getData(stringToPass, artistsSaved.username);
      myDataPromise.then(function(responseFavorites)
      {  
        //console.log(responseFollowings);
        p++;
        favoritesLists.push(responseFavorites);
        //console.log(p);
        if(p == max_artists_computed)
        {
          ProcessCollectionsObject.set("liked_artists_fav_lists", favoritesLists);
          $scope.getListArtists();
        }
      });
    }
  }
  $scope.artistList = function()
  {
    var likedArtists = [];
    var lookup = {};
    var likedTracks = UserObject.get("favorites");
    var len = likedTracks.length;
    console.log(likedTracks);
    var p = 0;
    var i = 0;
    for(i = 0; i < len; i++)
    {
      var stringToPass = "/users/" + likedTracks[i].user_id;
      var myDataPromise = Retrieve.getData(stringToPass, likedTracks[i].user);
      myDataPromise.then(function(artist_obj)
      {     
        
        var newArtist = artist_obj;
          //console.log(artist_obj);
          p++;
          newArtist.FREQ_FACTOR = 0;
          newArtist.NEW_FACTOR = len - p;
          newArtist.COMPOSITE_VALUE = newArtist.NEW_FACTOR;
          if(likedArtists.length == 0)
          {
            likedArtists.push(newArtist);
          }
          else
          {
            var result = findById( likedArtists, newArtist.id);
            if(result != null)
            {
              result.FREQ_FACTOR ++;
              result.COMPOSITE_VALUE = (result.FREQ_FACTOR * popularity_factor) + result.NEW_FACTOR;     
            }
     
            else
            {
              newArtist.COMPOSITE_VALUE = (newArtist.FREQ_FACTOR * popularity_factor) + newArtist.NEW_FACTOR;
              //console.log("new artist w composite: ", newArtist.COMPOSITE_VALUE);
              likedArtists.push(newArtist);
              
            }
          }
          ProcessCollectionsObject.set("liked_artists", likedArtists);
          if(p == len)
          { 
            likedArtists.sort(function(a,b) {return (a.COMPOSITE_VALUE < b.COMPOSITE_VALUE) ? 1 : ((b.COMPOSITE_VALUE < a.COMPOSITE_VALUE) ? -1 : 0);} ); 
            //!!!!!
            //UserArtists.set(likedArtists);
            //!!!!!
            ProcessCollectionsObject.set("liked_artists", likedArtists);
            $scope.getFavoritesLists();
          }
      });
    }  
  }


function findById(source, id_) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id_) 
    {
      return source[i];
    }
  }
  return null;
  //throw "Couldn't find object with id: " + id;
}



  $scope.retrieveLikes = function()
  {
    var allFavs = null;
    var stringToPass = "/users/" + UserObject.get("user_obj").id + "/favorites";
    //console.log("CRUDE FAV COUNT: ");
    //console.log(UserObject.get("user_obj").public_favorites_count);

    SC.get(stringToPass, {limit: 150}).then(function(favs) 
    {
        //console.log("USEABLE FAVS COUNT: ");
        //console.log(favs.length);
        //UserObject.set_fav_count(favs.length);
        UserObject.set("favorites", favs);
        //UserFavs.set(favs);
        $scope.artistList();
        //console.log(allFavs);
      });
  }

  $scope.categorizeUser = function()
  {
    if(UserObject.get_fav_count() > 0)
    {
      console.log("this user has favorites");
    }
  }

  $scope.GetUser = function (search_input) 
  {    
    /*
    SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
    {
        console.log(tracks);
    });
*/
this.show_suggestions = false;
var stringToPass = "/resolve.json?url=http://soundcloud.com/";
search_input = $scope.UserObject.get("user_obj").permalink;
stringToPass += search_input;
stringToPass += "&client_id=a06eaada6b3052bb0a3dff20329fdbf9";
/*
SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
{
  //console.log(tracks);
});
*/
$scope.show_recs = true;
SC.get(stringToPass).then(function(artistObj)
{
  UserObject.set("user_obj", artistObj);
  avatarPath = artistObj.avatar_url;
  avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
  var doc = document.getElementById("avatar_img");
  var attr = doc.attributes;
  doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("artistLabel").innerHTML = UserObject.get("user_obj").username;//ArtistObjects.getFirst().username;
        document.getElementById("searchField").value = "";
        $scope.autoCompleteUsername("a",'1');
        $scope.retrieveLikes();
$scope.categorizeUser();
      });

}

$scope.autoCompleteUsername = function(input)
{
    //console.log("auto complete was called");
    //console.log(input);
    if(input && input.length >= 3) 
    {
      this.show_suggestions = true;

      //document.getElementById('autocomplete_list').style.visibility = "visible";

      $scope.input_suggestions = [];
      SC.get('/users', {q: input, limit: 200, track_count: {from: 2}}).then(function(users) 
      {
        //console.log(users);
        $scope.input_suggestions = users;
        //setTimeout(function () {
          $scope.$apply(function () {
            $scope.message = "Timeout called!";
          });
    //},);
    });
    }
    else
    {
      $scope.show_suggestions = false;
    }
  }

  $scope.selectUser = function(selectedUser)
  {
    this.show_suggestions = false;
      //console.log("selected user:");
      //console.log(selectedUser);
      UserObject.set("user_obj",selectedUser);
      this.show_suggestions = false;
      document.getElementById("searchField").value = selectedUser.username;
      document.getElementById("autocomplete_list").attributes[1].nodeValue = false;
      $scope.show_suggestions = false;
      $scope.input_suggestions = [];
    }
  })


















.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
