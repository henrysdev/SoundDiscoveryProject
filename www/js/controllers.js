angular.module('GeniusTracklist.controllers', [])





.controller('RecCtrl', function($scope, $state, $stateParams, UserObject, Retrieve, Embed, StoredEmbedLinks, ProcessCollectionsObject, GlobalFunctions, FullReset, SessionCache) 
{
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'http://localhost:8100/#/recs'
  });

  $scope.UserObject = UserObject;
  $scope.recommendedTracks = [];
  $scope.searchText = "";
  $scope.show_general_ui = false;
  $scope.show_tracks = false;
  $scope.show_recs = false;
  $scope.show_player = false;
  $scope.player_loaded = false;
  $scope.fav_icons = [];
  $scope.selected_favorites = [];
  var avatarPath = "";
  var widgets = [];
  $scope.show_pause = true;
  $scope.show_fav_selection = true;
  $scope.show_prog_bar = false;
  $scope.show_profile = true;
  $scope.done_picking_favs = true;
  $scope.loading = true;
  $scope.loading_text = "";
  $scope.current_selected_stream = null;
  $scope.default_checked = true;
  $scope.toggleSelect = false;
  $scope.currentTrackIndex = 0;
  $scope.initialCalc = true;

  //player-widget material
  $scope.playingTrack = null;
  $scope.currentSoundCloudLink = "";
  //

  //
  $scope.searchTimeStart = null;
  $scope.searchTimeEnd = null;
  //

  //scaling limits for get calls
  var liked_artists_max_favlist_length = 200;
  var max_artists_computed = 10;
  var max_recs_computed = 30;
  var max_tracks_per_rec = 1;
  var popularity_factor = 0;//0.455
  //



$scope.activeSong;
//Does a switch of the play/pause with one button.
$scope.playPause = function(id,cond){
  $scope.activeSong = document.getElementById(id);
  if($scope.activeSong.paused == true)
  {    
    $scope.play(id);
  }  
  else
  {  
    $scope.pause(id);
  }    //Sets the active song since one of the functions could be play.
    
    //Checks to see if the song is paused, if it is, play it from where it left off otherwise pause it.

}
//Pauses the active song.
$scope.pause = function(){
    $scope.activeSong.pause();
    $scope.show_pause = true;
}

$scope.play = function(id){
    $scope.show_pause = false;
    //Sets the active song to the song being played.  All other functions depend on this.
    $scope.activeSong = document.getElementById(id);
    //Plays the song defined in the audio tag.
    $scope.activeSong.play();

    //Calculates the starting percentage of the song.
    /*
    var percentageOfVolume = $scope.activeSong.volume / 1;
    var percentageOfVolumeMeter = document.getElementById('volumeMeter').offsetWidth * percentageOfVolume;
    
    //Fills out the volume status bar.
    document.getElementById('volumeStatus').style.width = Math.round(percentageOfVolumeSlider) + "px";
  */
}


$scope.skipBack = function()
{
  if($scope.activeSong.currentTime > 2)
    $scope.activeSong.currentTime = 0;
  else
    if($scope.currentTrackIndex > 0)
    {
      $scope.currentTrackIndex --;
      $scope.playSong($scope.recommendedTracks[$scope.currentTrackIndex]);
    }

}

$scope.skipFwd = function()
{
  if($scope.currentTrackIndex < $scope.recommendedTracks.length-1)
  { 
    $scope.currentTrackIndex ++;
  }
  else
  {
    $scope.currentTrackIndex = 0;
  }
  $scope.playSong($scope.recommendedTracks[$scope.currentTrackIndex]);
}

//Updates the current time function so it reflects where the user is in the song.
//This function is called whenever the time is updated.  This keeps the visual in sync with the actual time.
$scope.updateTime = function(){
    var currentSeconds = (Math.floor($scope.activeSong.currentTime % 60) < 10 ? '0' : '') + Math.floor($scope.activeSong.currentTime % 60);
    var currentMinutes = Math.floor($scope.activeSong.currentTime / 60);
    //Sets the current song location compared to the song duration.
    document.getElementById('songTime').innerHTML = currentMinutes + ":" + currentSeconds + ' / ' + Math.floor($scope.activeSong.duration / 60) + ":" + (Math.floor($scope.activeSong.duration % 60) < 10 ? '0' : '') + Math.floor($scope.activeSong.duration % 60);


    //Fills out the slider with the appropriate position.
    var percentageOfSong = ($scope.activeSong.currentTime/$scope.activeSong.duration);
    var percentageOfSlider = document.getElementById('songSlider').offsetWidth * percentageOfSong;
    
    //Updates the track progress div.
    document.getElementById('trackProgress').style.width = Math.round(percentageOfSlider) + "px";
    document.getElementById('trackProgress').style.height = document.getElementById('songSlider').height + "px";
}

$scope.volumeUpdate = function(number){
    //Updates the volume of the track to a certain number.
    $scope.activeSong.volume = number / 100;
}
//Changes the volume up or down a specific number
$scope.changeVolume = function(number, direction){
    //Checks to see if the volume is at zero, if so it doesn't go any further.
    if($scope.activeSong.volume >= 0 && direction == "down"){
        $scope.activeSong.volume = $scope.activeSong.volume - (number / 100);
    }
    //Checks to see if the volume is at one, if so it doesn't go any higher.
    if($scope.activeSong.volume <= 1 && direction == "up"){
        $scope.activeSong.volume = $scope.activeSong.volume + (number / 100);
    }
    
    //Finds the percentage of the volume and sets the volume meter accordingly.
    var percentageOfVolume = $scope.activeSong.volume / 1;
    var percentageOfVolumeSlider = document.getElementById('volumeMeter').offsetWidth * percentageOfVolume;

    document.getElementById('volumeStatus').style.width = Math.round(percentageOfVolumeSlider) + "px";
}
//Sets the location of the song based off of the percentage of the slider clicked.
$scope.setLocation = function(percentage){
    $scope.activeSong.currentTime = $scope.activeSong.duration * percentage;
}
/*
Gets the percentage of the click on the slider to set the song position accordingly.
Source for Object event and offset: http://website-engineering.blogspot.com/2011/04/get-x-y-coordinates-relative-to-div-on.html
*/
$scope.setSongPosition = function(e){
    //Gets the offset from the left so it gets the exact location.
    var obj = document.getElementById("songSlider");
    var songSliderWidth = obj.offsetWidth;
    var evtobj=window.event? event : e;
    clickLocation =  (evtobj.layerX - (obj.offsetLeft)) + 10;
    
    var percentage = (clickLocation/songSliderWidth);
    console.log("percentage: " + percentage);
    //Sets the song location with the percentage.
    $scope.setLocation(percentage);
}

//Set's volume as a percentage of total volume based off of user click.
$scope.setVolume = function(percentage){
    $scope.activeSong.volume =  percentage;
    
    var percentageOfVolume = $scope.activeSong.volume / 1;
    var percentageOfVolumeSlider = document.getElementById('volumeMeter').offsetWidth * percentageOfVolume;
    
    document.getElementById('volumeStatus').style.width = Math.round(percentageOfVolumeSlider) + "px";
}

//Set's new volume id based off of the click on the volume bar.
$scope.setNewVolume = function(obj,e){
    var volumeSliderWidth = obj.offsetWidth;
    var evtobj = window.event? event: e;
    clickLocation = evtobj.layerX - obj.offsetLeft;
    
    var percentage = (clickLocation/volumeSliderWidth);
    setVolume(percentage);
}
//Stop song by setting the current time to 0 and pausing the song.
$scope.stopSong = function(){
    $scope.activeSong.currentTime = 0;
    $scope.activeSong.pause();
}

  $scope.canPlay = function()
  {
    $scope.player_loaded = true;
    $scope.show_player = true;
  }

  $scope.controlWidget = function()
  {
    $scope.activeSong = document.getElementById("song");

    $scope.activeSong.addEventListener("timeupdate", function(){
      $scope.updateTime();
    });
    $scope.activeSong.addEventListener("ended", function(){
     $scope.activeSong.currentTime = 0;
      console.log("finished Playing");
      
        if($scope.currentTrackIndex < ($scope.recommendedTracks.length-1))
          $scope.currentTrackIndex++;
        else
          $scope.currentTrackIndex = 0;
        $scope.playSong($scope.recommendedTracks[$scope.currentTrackIndex]);
        $scope.$apply(function () {
         $scope.player_loaded = false;
        $scope.show_player = true;
    });
    });




}
  $scope.playSong = function(track)
  {
    $scope.playingTrack = track;
    for(var i = 0; i < $scope.recommendedTracks.length; i++)
    {
      if(track.id == $scope.recommendedTracks[i].id)
      {
        $scope.currentTrackIndex = i;
      }
    }
    $scope.currentSoundCloudLink = "https://w.soundcloud.com/icon/?url=http%3A%2F%2Fsoundcloud.com%2F";
    console.log(track.user.permalink);
    $scope.currentSoundCloudLink += track.user.permalink;
    $scope.currentSoundCloudLink += "/";
    $scope.currentSoundCloudLink += track.permalink;
    $scope.currentSoundCloudLink += "&color=orange_white&size=64 style=width: 64px; height: 64px;"
    document.getElementById("scLink").src = $scope.currentSoundCloudLink;
    console.log(track);
    //src="http://api.soundcloud.com/tracks/148976759/stream?client_id=a06eaada6b3052bb0a3dff20329fdbf9"
    var trackStream = "http://api.soundcloud.com/tracks/";
    trackStream += track.id;
    trackStream += "/stream?client_id=a06eaada6b3052bb0a3dff20329fdbf9";
    var simplePlayer = document.getElementById("song");
    simplePlayer.src = trackStream;
    console.log("player source:");
    console.log(simplePlayer.src);
    $scope.play('song');
  }

  $scope.editCriteria = function()
  {
    $scope.initialCalc = false;
    ProcessCollectionsObject.clear_();
    $scope.fav_icons = [];
    $scope.recommendedTracks = [];
    UserObject.set("favorites", null);
    $scope.retrieveLikes();
    $scope.UI_states("search_criteria");
  }

  $scope.goHome = function()
  {
    FullReset.set(true);
    //$state.go('home', {}, {reload: true});
    $state.go('home');
  }

  $scope.UI_states = function(state)
  {
    switch(state)
    {
      case "generating":
        console.log("GENERATING");
        $scope.loading = true;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        break;
      case "search_criteria":
        console.log("SEARCH_CRITERIA");
        $scope.loading = false;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = true;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        break;
      case "results":
        console.log("RESULTS");
        $scope.loading = false;
        $scope.show_recs = true;
        $scope.show_tracks = true;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = true;
        break;
      default:
        $scope.loading = false;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        break;
    }
  }

  $scope.weedOutTracks = function(track)
  {
    //if(track.favoritings_count == 0)
     // return false;
    if(track.duration > 960000 || track.duration < 60000)
      return false;
    if(track.playback_count < 100)
      return false;
    if(track.favoritings_count < 10)
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
    var track_cache = SessionCache.getTracks();
    for(var i = 0; i < track_cache.length; i++)
    {
      if(track.id == track_cache[i])
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

  $scope.startCalculation = function()
  {
    UserObject.set("favs_to_use", $scope.selected_favorites);
    max_artists_computed = $scope.selected_favorites.length;
    //$scope.done_picking_favs = false;
    $scope.UI_states("generating");
    $scope.artistList();
    $scope.searchTimeStart = new Date().getTime();
  }

  $scope.getIconArt = function(track)
  {
    if(track == null)
      return;
    var url = track.artwork_url;
    if(url == null)
      return track.user.avatar_url;
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
    $scope.loading_text = "embedding links";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;

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
    $scope.UI_states("results");
    $scope.show_fav_selection = false;
    $scope.show_player = true;
    var stream_link = "https://w.soundcloud.com/player/?visual=false&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F13692671&show_artwork=true&auto_play=true";
    $scope.current_selected_stream = stream_link;
    //document.getElementById("iframe_widget").src = $scope.current_selected_stream;
    $scope.playSong(list_[0]);
     $scope.$apply(function () {
        $scope.recommendedTracks = list_;
        SessionCache.setList($scope.recommendedTracks);
          $scope.controlWidget();
        //DEBUG_TIMING
          var end = new Date().getTime();
          var time = end - start;
          console.log('execution time for ' + $scope.loading_text + ': ' + time);


          $scope.searchTimeEnd = new Date().getTime();
          var diff = $scope.searchTimeEnd - $scope.searchTimeStart;
          console.log('TOTAL SEARCH TIME: ' + diff);

          //DEBUG_TIMING
        });

  }

  $scope.getTopTracks = function()
  {

    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading_text = "retrieving best tracks";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;

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
      console.log(i);
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
        console.log(p);
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
          console.log("jere");
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
        $scope.recommendedTracks = masterList;
        
      });
    }
  }
  
  $scope.combineAndCompare = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading_text = "comparing recommendation lists";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;

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

    var liked_artists = ProcessCollectionsObject.get("liked_artists");

    $scope.loading_text = "processing 2nd generation favorites lists";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;

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
        if(!GlobalFunctions.findById(liked_artists,allFavoritesList[i][n].user_id))
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
  }

  $scope.getFavoritesLists = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading_text = "fetching artists fav lists";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;
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
    $scope.loading_text = "processing artists";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;
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
    $scope.loading_text = "retrieving favorites";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;
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

        if($scope.initialCalc == true)
          $scope.startCalculation();
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
      $scope.UI_states("generating");
      $scope.retrieveLikes();
  })

})















.controller('HomeCtrl', function($scope, $state, UserObject, Retrieve, Embed, /* StoredEmbedLinks,*/ ProcessCollectionsObject, FullReset) 
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
  var curr_input = "";

  $scope.$on('$ionicView.enter', function(ev) {
    if(FullReset.get() == true)
      window.location.reload(true)
    else
    {
      input.focus();
      input.select();
    }
  })
    




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
        document.getElementById("searchField").value = "";
        $scope.autoCompleteUsername("a",'1');
        
        $state.go('recs');
    });

}

$scope.autoCompleteUsername = function(input)
{
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
        $scope.user_loading_wheel = false;

          $scope.$apply(function () {
            $scope.message = "Timeout called!";
          });
    });
    }
  }
  else
  {
    $scope.user_loading_wheel = false;
    $scope.input_suggestions = [];
    $scope.show_suggestions = false;
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

  $scope.extraDetails = function(suggestion)
  {
    var strToReturn = "";

    if(suggestion.city != null && suggestion.country != null)
    {
      strToReturn += suggestion.city;
      strToReturn += ", ";
      strToReturn += suggestion.country;
    }
    else
      strToReturn = "";
    return strToReturn;
  }





});


