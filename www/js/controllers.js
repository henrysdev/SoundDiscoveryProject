angular.module('GeniusTracklist.controllers', [])


.controller('RecCtrl', function($scope, $state, $stateParams, UserObject, Retrieve, Embed, StoredEmbedLinks, ProcessCollectionsObject, GlobalFunctions) 
{
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'http://localhost:8100/#/recs' //'https://soundcloud.com/user-8492062'
  });
  $scope.UserObject = UserObject;
  $scope.recommendedTracks = [];
  $scope.searchText = "";
  $scope.show_tracks = false;
  $scope.show_recs = false;
  $scope.fav_icons = [];
  $scope.selected_favorites = [];
  var avatarPath = "";
  var widgets = [];
  $scope.show_fav_selection = true;
  $scope.show_profile = true;
  $scope.done_picking_favs = true;
  $scope.loading = true;
  $scope.loading_text = "";
  $scope.current_selected_stream = null;
  $scope.default_checked = true;
  $scope.toggleSelect = false;
  $scope.currentTrackIndex = 0;

  //scaling limits for get calls
  var liked_artists_max_favlist_length = 200;
  var max_artists_computed = 5;
  var max_recs_computed = 30;
  var max_tracks_per_rec = 1;
  var popularity_factor = 0;//0.455
  //

  $scope.controlWidget = function()
  {
    
    var iframeElement   = document.getElementById('iframe_widget');
    var widget         = SC.Widget(iframeElement);
    iframeElement.contentWindow.focus();

    iframeElement.addEventListener("load", function() {
      //console.log("widget it loading");
    });


    widget.bind(SC.Widget.Events.READY, function() {
      console.log("ready");
      $scope.$apply(function () {
        $scope.show_tracks = true;
        $scope.show_recs = true;
        $scope.loading = false;
      console.log("track is loading");
      });
    widget.bind(SC.Widget.Events.FINISH, function() {
      console.log("finished Playing");
        if($scope.currentTrackIndex < ($scope.recommendedTracks.length-1))
          $scope.currentTrackIndex++;
        else
          $scope.currentTrackIndex = 0;
        //var stream_link = "https://w.soundcloud.com/player/?visual=false&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F13692671&show_artwork=true&auto_play=true"; //StoredEmbedLinks.get(track.id);
        //$scope.current_selected_stream = stream_link;
        //iframeElement.src = $scope.selected_stream;
        widget.load($scope.recommendedTracks[$scope.currentTrackIndex].permalink_url, {
          show_artwork: true,
          auto_play: true,
          show_comments: false,
          buying: false,
          show_playcount: false
        });


      });
  });
  }

  $scope.weedOutTracks = function(track)
  {
    //if(track.favoritings_count == 0)
     // return false;
    if(track.duration > 960000 || track.duration < 60000)
      return false;
    if(track.playback_count < 100)
      return false;
    if(track.streamable == false)
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

  

  $scope.selectAll = function(cond, fav_icons)
  {
    if(cond == true)
    {
      $scope.selected_favorites = [];
      for(var i = 0; i < fav_icons.length; i++)
      {
        $scope.selected_favorites.push(fav_icons[i].icon)
      }
      $scope.toggleSelect = false;
      $scope.default_checked = true;
    }
    else if(cond == false)
    {
      $scope.selected_favorites = [];
      $scope.default_checked = false;
      $scope.toggleSelect = true;
    }
  }

  $scope.newSearch = function()
  {
    console.log("clicked");
  }

  $scope.playSong = function(track)
  {
    for(var i = 0; i < $scope.recommendedTracks.length; i++)
    {
      if(track.id == $scope.recommendedTracks[i].id)
      {
        $scope.currentTrackIndex = i;
      }
    }

    var stream_link = "https://w.soundcloud.com/player/?visual=false&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F13692671&show_artwork=true&auto_play=true"; //StoredEmbedLinks.get(track.id);
    $scope.current_selected_stream = stream_link;
    $scope.show_recs = true;
    document.getElementById("iframe_widget").src = $scope.current_selected_stream;
    var iframeElement   = document.getElementById('iframe_widget');
    var widget         = SC.Widget(iframeElement);
    widget.load($scope.recommendedTracks[$scope.currentTrackIndex].permalink_url, {
          show_artwork: true,
          auto_play: true,
          show_comments: false,
          buying: false,
          show_playcount: false
        });
    //$scope.controlWidget();
  }

  $scope.startCalculation = function()
  {
    UserObject.set("favs_to_use", $scope.selected_favorites);
    max_artists_computed = $scope.selected_favorites.length;
    $scope.done_picking_favs = false;
    $scope.show_fav_selection = false;
    $scope.show_recs = true;
    $scope.artistList();
  }

  $scope.getIconArt = function(url)
  {
    if(url == null)
      return "http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=25059535";
    else
      return url;
  }

  $scope.updateChecked = function(track)
  {
    if(track.checked == true)
      $scope.selected_favorites.push(track.icon);
    else if(track.checked == false)
    {
      var index = $scope.selected_favorites.indexOf(track.icon);
      $scope.selected_favorites.splice(index,1);
    }
  }

  $scope.newUser = function()
  {

    ProcessCollectionsObject.clear_();
    UserObject.clear_();
   //StoredEmbedLinks.clear_();
    $scope.searchText = "";
    $scope.show_tracks = false;
    $scope.show_recs = false;
    $scope.show_suggestions = true;
    $scope.fav_icons = [];
    $scope.selected_favorites = [];
    var avatarPath = "";
    var widgets = [];
    $scope.show_fav_selection = false;
    $scope.show_profile = false;
    $scope.done_picking_favs = true;
    $scope.loading = false;
    $scope.loading_text = "";
    $scope.current_selected_stream = null;
    $scope.default_checked = true;
    $scope.toggleSelect = false;

    //scaling limits for get calls
    liked_artists_max_favlist_length = 200;
    max_artists_computed = 5;
    max_recs_computed = 30;
    max_tracks_per_rec = 1;
    popularity_factor = 0;//0.455
  }

  $scope.embed = function(list_) 
  {
    this.loading_text = "embedding links";

    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING


    var givenList = list_;
    /*
    for(var b = 0; b < givenList.length; b++)
    {
      var track_url = givenList[b].permalink_url;
      var id_ = givenList[b].id;
      refinedString = "https://w.soundcloud.com/player/?visual=false&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F";
      refinedString += id_;
      refinedString += "&show_artwork=true&auto_play=true";
      var obj_to_store = {streamLink: refinedString, trackID:id_};
      StoredEmbedLinks.set(obj_to_store);
    }
    */
    $scope.playSong(list_[0]);
     $scope.$apply(function () {
        $scope.recommendedTracks = list_;
        //DEBUG_TIMING
          var end = new Date().getTime();
          var time = end - start;
          $scope.controlWidget();
          console.log('execution time for ' + $scope.loading_text + ': ' + time);
          //DEBUG_TIMING
        });

  }

  $scope.getTopTracks = function()
  {

    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    this.loading_text = "retrieving best tracks";
    var recArtists = ProcessCollectionsObject.get("rec_artists_list");
    var masterList = [];
    var p = 0;
    var i = 0;
    var extra_track_count = 0;
    var max_tracks_local = max_tracks_per_rec;
    $scope.recommendedTracks = [];
    console.log("num of rec artists: " + recArtists.length);
    for(i = 0; i < max_recs_computed; i++)
    {
      if(recArtists[i].OVERLAP == "false" && max_artists_computed > 1)
      {
        extra_track_count ++;
        p++;
        continue;
      }
      var stringToPass = "/users/" + recArtists[i].permalink + "/tracks";
      //console.log(stringToPass);

      var myDataPromise = Retrieve.getData(stringToPass);
      myDataPromise.then(function(responseTracks)
      {  
        if(extra_track_count > 0)
          max_tracks_local ++;
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
          //miniTracklist.splice(miniTracklist.length/2, (miniTracklist.length - miniTracklist.length/2));
          var half_length = Math.ceil(miniTracklist.length / 2);    
          var leftSide = miniTracklist.splice(0,half_length);
          miniTracklist = leftSide;
          miniTrackList = GlobalFunctions.shuffle(leftSide);
          
          
          miniTracklist.splice(max_tracks_local, (miniTracklist.length - max_tracks_local));
          extra_track_count --;
          max_tracks_local = max_tracks_per_rec;
        }
        for(var l = 0; l < miniTracklist.length; l++)
          masterList.push(miniTracklist[l]);
        p++;
        if(p == max_recs_computed)
        {
          masterList.sort(function(a,b) {return (a.COMP_SCORE < b.COMP_SCORE) ? 1 : ((b.COMP_SCORE < a.COMP_SCORE) ? -1 : 0);} ); 
          var linkString = "";
          for(var t = 0; t < masterList.length; t++)
          {
            linkString += masterList[t].permalink_url;
            linkString += "\n";
          }

          ProcessCollectionsObject.set("rec_track_list", masterList);
          //console.log("MASTERLIST:");
          //console.log(masterList);

          //DEBUG_TIMING
          var end = new Date().getTime();
          var time = end - start;
          console.log('execution time for ' + $scope.loading_text + ': ' + time);
          //DEBUG_TIMING

          $scope.embed(masterList);
        }
        $scope.show_recs = true;
        $scope.recommendedTracks = masterList;
        
      });
    }
  }
  
  $scope.combineAndCompare = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    this.loading_text = "comparing recommendation lists";

    var allArtistsList = ProcessCollectionsObject.get("sec_gen_liked_artists");
    var masterArtistList = [];

    for(var i = 0; i < allArtistsList.length; i++)
    {
      var currentArtist = allArtistsList[i];
      currentArtist.FREQ = 1;
      currentArtist.SCORE = 0;
      var result = GlobalFunctions.findById(masterArtistList, currentArtist.id);
     // console.log("path: " + currentArtist.PATH);
      if(result != null)
      {
        result.OVERLAP = "true";
        result.FREQ++;
        result.SCORE = result.FREQ + (result.FREQ / result.followings_count);
        //masterList.push(currentArtist)
      }
      else
      {
        currentArtist.OVERLAP = "false";
        masterArtistList.push(currentArtist);
      }
    }
    masterArtistList.sort(function(a,b) {return (a.FREQ < b.FREQ) ? 1 : ((b.FREQ < a.FREQ) ? -1 : 0);} ); 

    //DEBUG_TIMING
    var end = new Date().getTime();
    var time = end - start;
    console.log('execution time for ' + $scope.loading_text + ': ' + time);
    //DEBUG_TIMING

    ProcessCollectionsObject.set("rec_artists_list", masterArtistList);
    $scope.getTopTracks();
  }
  $scope.getListArtists = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    this.loading_text = "processing 2nd generation favorites lists";
    var allFavoritesList = ProcessCollectionsObject.get("liked_artists_fav_lists");
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
          p++;
          artistsListToPass.push(responseArtists);
          if(p == max_count)
          {
            ProcessCollectionsObject.set("sec_gen_liked_artists", artistsListToPass);
            
            //DEBUG_TIMING
            var end = new Date().getTime();
            var time = end - start;
            console.log('execution time for ' + $scope.loading_text + ': ' + time);
            //DEBUG_TIMING

            $scope.combineAndCompare();
          }
        });
      }    
    }
  }

  $scope.getFavoritesLists = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    this.loading_text = "fetching artists fav lists";
    //var artistsSaved = UserArtists.get();
    var artistsSaved = ProcessCollectionsObject.get("liked_artists");
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
      console.log("MAX FAVLIST LEN: " + liked_artists_max_favlist_length);
      var myDataPromise = Retrieve.getData(stringToPass, artistsSaved.username, liked_artists_max_favlist_length);
      myDataPromise.then(function(responseFavorites)
      {  
        //console.log(responseFollowings);
        p++;
     //   responseFavorites.PATH = artistsSaved[p].username;
        favoritesLists.push(responseFavorites);
        //console.log(p);
        if(p == max_artists_computed)
        {
          ProcessCollectionsObject.set("liked_artists_fav_lists", favoritesLists);

          //DEBUG_TIMING
          var end = new Date().getTime();
          var time = end - start;
          console.log('execution time for ' + $scope.loading_text + ': ' + time);
          //DEBUG_TIMING

          $scope.getListArtists();
        }
      });
    }
  }
  $scope.artistList = function()
  {

    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading = true;
    this.loading_text = "processing artists";
    var likedArtists = [];
    var lookup = {};
    var likedTracks = UserObject.get("favs_to_use");
    var len = likedTracks.length;
    var p = 0;
    var i = 0;

    liked_artists_max_favlist_length = Math.ceil(200 / likedTracks.length);
    if(liked_artists_max_favlist_length < 10)
      liked_artists_max_favlist_length = Math.floor(Math.random() * (20 - 8 + 1)) + 8;
    console.log("CALCULATING SUGGESTIONS FOR : " + likedTracks.length);
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
            var result = GlobalFunctions.findById( likedArtists, newArtist.id);
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

            //DEBUG_TIMING
            var end = new Date().getTime();
            var time = end - start;
            console.log('execution time for ' + $scope.loading_text + ': ' + time);
            //DEBUG_TIMING

            $scope.getFavoritesLists();
          }
      });
    }  
  }


  $scope.retrieveLikes = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING
    this.loading_text = "retrieving favorites";
    var allFavs = null;
    var stringToPass = "/users/" + UserObject.get("user_obj").id + "/favorites";
    //console.log("CRUDE FAV COUNT: ");
    //console.log(UserObject.get("user_obj").public_favorites_count);

    SC.get(stringToPass, {limit: 150}).then(function(favs) 
    {
      $scope.loading = false;
        //console.log("USEABLE FAVS COUNT: ");
        //console.log(favs.length);
        //UserObject.set_fav_count(favs.length);
        UserObject.set("favorites", favs);  
        //$scope.$apply(function () {
        for(var i = 0; i < favs.length; i++)
        {
          var new_icon = {checked : false, icon : favs[i]};
          $scope.fav_icons.push(new_icon);
        }
        $scope.$apply(function () {
          $scope.fav_icons;
        });
        //$scope.artistList();

        //DEBUG_TIMING
        var end = new Date().getTime();
        var time = end - start;
        console.log('execution time for ' + $scope.loading_text + ': ' + time);
        //DEBUG_TIMING

      });
  }

  $scope.$on('$ionicView.enter', function(ev) {
    var artistObj = UserObject.get("user_obj");
    avatarPath = artistObj.avatar_url;
        avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
        var doc = document.getElementById("avatar_img");
        var attr = doc.attributes;
        doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("artistLabel").innerHTML = UserObject.get("user_obj").username;//ArtistObjects.getFirst().username;
      $scope.retrieveLikes();
  })

})

















.controller('SearchCtrl', function($scope, $state, UserObject, Retrieve, Embed, /* StoredEmbedLinks,*/ ProcessCollectionsObject) 
{
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'http://localhost:8100/#/home' //'https://soundcloud.com/user-8492062'
  });
  $scope.UserObject = UserObject;
  $scope.input_suggestions = [];
  $scope.searchText = "";
  $scope.show_suggestions = true;
  $scope.user_loading_wheel = false;
    var input = document.getElementById('searchField');
  input.focus();
  input.select();

    $scope.GetUser = function (search_input) 
    {  
      var stringToPass = "/resolve.json?url=http://soundcloud.com/";
      search_input = $scope.UserObject.get("user_obj").permalink;
      stringToPass += search_input;
      stringToPass += "&client_id=a06eaada6b3052bb0a3dff20329fdbf9";
      $scope.show_profile = true;
      $scope.show_fav_selection = true;
      SC.get(stringToPass).then(function(artistObj)
      {
        UserObject.set("user_obj", artistObj);
        /*
        avatarPath = artistObj.avatar_url;
        avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
        var doc = document.getElementById("avatar_img");
        var attr = doc.attributes;
        doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("artistLabel").innerHTML = UserObject.get("user_obj").username;//ArtistObjects.getFirst().username;
        */
        document.getElementById("searchField").value = "";
        $scope.autoCompleteUsername("a",'1');
        
        $state.go('recs');
    });

}

$scope.autoCompleteUsername = function(input)
{
    //console.log("auto complete was called");
    //console.log(input);
    if(input)
    {
      if(input.length >= 3)
      {
        $scope.user_loading_wheel = true;
        this.show_suggestions = true;

      //document.getElementById('autocomplete_list').style.visibility = "visible";

      $scope.input_suggestions = [];
      SC.get('/users', {q: input, limit: 200, track_count: {from: 2}}).then(function(users) 
      {
        //console.log(users);
        $scope.input_suggestions = users;
        if($scope.input_suggestions.length == 0)
          $scope.user_loading_wheel = true;
        else
          $scope.user_loading_wheel = false;
        //setTimeout(function () {
          $scope.$apply(function () {
            $scope.message = "Timeout called!";
          });
    //},);
    });
    }
  }
  else
  {
    $scope.input_suggestions = [];
    $scope.show_suggestions = false;
    /*
    $scope.$apply(function () {
            $scope.message = "Timeout called!";
          });
*/
  }
}

$scope.selectUser = function(selectedUser)
{
  $scope.newUser();
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

$scope.newUser = function()
  {
    UserObject.clear_();
    $scope.searchText = "";
    $scope.show_suggestions = true;
    $scope.loading_text = "";

  }




});
