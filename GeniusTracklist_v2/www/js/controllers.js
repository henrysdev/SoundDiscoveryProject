
var app = angular.module('GeniusTracklist');


/* CORRECT WAY TO DO MODAL
var ModalInstanceCtrl = function ($scope, $uibModalInstance, items) {
  $scope.ok = function () {
    console.log("called ok");
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    console.log("called cancel");
    $uibModalInstance.dismiss('cancel');
  };
};
*/

app.controller('RecCtrl', function($uibModal, $log, $scope, $state, ModalService, $stateParams, UserObject, Retrieve, Embed, StoredEmbedLinks, ProcessCollectionsObject, GlobalFunctions, FullReset, SessionCache) 
{
  console.log("REC CTRL CALLED");
  console.log(angular.module);
  var DEBUG = true;
  var CLIENT_ID = 'a06eaada6b3052bb0a3dff20329fdbf9';
  var REDIRECT_URI = 'http://www.geniustracklist.com/callback.html';
  if(DEBUG == true)
  {
    CLIENT_ID = '0c98c2110c32313f674e6a18eec6eb93'; //'a06eaada6b3052bb0a3dff20329fdbf9';
    REDIRECT_URI = 'http://localhost:8000/www/callback.html'; 
  }

  SC.initialize({
    client_id: CLIENT_ID, //' a06eaada6b3052bb0a3dff20329fdbf9'
    redirect_uri: REDIRECT_URI //'http://www.geniustracklist.com/callback.html'
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
  $scope.show_empty_profile = false;
  $scope.show_pause = true;
  $scope.show_fav_selection = true;
  $scope.show_prog_bar = false;
  $scope.show_profile = true;
  $scope.done_picking_favs = true;
  $scope.loading = true;
  $scope.loading_text = "";
  $scope.detailed_loading_text = "";
  $scope.current_selected_stream = null;
  $scope.default_checked = true;
  $scope.toggleSelect = false;
  $scope.currentTrackIndex = 0;
  $scope.initialCalc = true;
  $scope.show_mute = true;

  //player-widget material
  $scope.playingTrack = null;
  $scope.currentSoundCloudLink = "";
  $scope.hasMadePlaylist = false;
  //
$scope.availability = null;
  $scope.allowCalculation = false;
  //


  //backups + exception handling
  $scope.searchTimeStart = null;
  $scope.searchTimeEnd = null;
  $scope.DEBUG_max_count = 0;
  $scope.DEBUG_fav_count = 0;
  $scope.loadingStage = 0;
  $scope.lastLoadingStage = 0;
  $scope.scalingCondition = false;
  $scope.favoritesListsBackup = [];
  $scope.masterListBackup = [];
  $scope.artistsListToPassBackup 
  $scope.timedOut = false;
  $scope.functIter = 0;
  $scope.earlyFunctIter = 0;
  //

  //scaling limits for get calls
  var liked_artists_max_favlist_length = 200;
  var max_artists_computed = 10;
  var max_recs_computed = 30;
  var max_tracks_per_rec = 1;
  var popularity_factor = 0;//0.455
  //

  //
  var counter = 1;
  var tt = null;


$scope.activeSong;
//Does a switch of the play/pause with one button.



/* CORRECT WAY TO DO MODAL
  $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function () {
    console.log("called")
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/test.html',
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

$scope.show = function() {
        ModalService.showModal({
            templateUrl: 'templates/test.html',
            controller: 'ModalController',
            scope: $scope
        }).then(function(modal) {
          console.log(modal);
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.message = "You said " + result;
            });
        });
    }
*/

$scope.openFavModal=function(){
    $scope.modalInstance=$uibModal.open({
        templateUrl: 'templates/modal_fav.html',
        scope:$scope
    });

}

$scope.openInfoModal=function(){
    $scope.modalInstance=$uibModal.open({
        templateUrl: 'templates/modal_info.html',
        scope:$scope
    });

}

$scope.close=function(){
    $scope.modalInstance.dismiss();//$scope.modalInstance.close() also works I think
};




$scope.removeTrack = function()
{
  SessionCache.blacklist($scope.recommendedTracks[$scope.currentTrackIndex]);
  if($scope.recommendedTracks.length > 1)
  {
    $scope.recommendedTracks.splice($scope.currentTrackIndex, 1);
    $scope.currentTrackIndex--;
    $scope.skipFwd();
  }
}



  $scope.noFavorites = function()
  {
    $scope.UI_states("empty_profile");
    $scope.$apply(function (){
      $scope.show_empty_profile = true;
    });

  }

$scope.keyPress = function(keyEvent) {
  if(!$scope.show_player)
    return;
  switch(keyEvent.which)
  {
    case 37:
      $scope.skipBack();
      break;
    case 39:
      $scope.skipFwd();
      break;
    case 32:
      $scope.playPause('song');
      break;
    case 48:
      $scope.skipTo(0);
      break;
    case 49:
      $scope.skipTo(1);
      break;
    case 50:
      $scope.skipTo(2);
      break;
    case 51:
      $scope.skipTo(3);
      break;
    case 52:
      $scope.skipTo(4);
      break;
    case 53:
      $scope.skipTo(5);
      break;
    case 54:
      $scope.skipTo(6);
      break;
    case 55:
      $scope.skipTo(7);
      break;
    case 56:
      $scope.skipTo(8);
      break;
    case 57:
      $scope.skipTo(9);
      break;
    case 77:
      $scope.muteUnmute('song');
      break;
  }

}

$scope.publishPlaylist = function()
{
  console.log("Called");
  if(localStorage.getItem('loggedIn') == "true")
  {
    var tracks = [];//[{id: 290}, {id: 291}, {id: 292}];
    for(var i = 0; i < $scope.recommendedTracks.length; i++)
    {
      tracks.push({id: $scope.recommendedTracks[i].id});
    }
    var title = UserObject.get("user_obj").username;
    title += " - Genius Tracklist"
    SC.post('/playlists', {
      playlist: { title: title, tracks: tracks }
    });
    $scope.hasMadePlaylist = true;
    console.log("made it to end of it");
  }
  else
  {
    SC.connect().then(function() {
      localStorage.setItem('loggedIn', "true");
      $scope.publishPlaylist();
      /*
      var tracks = [];//[{id: 290}, {id: 291}, {id: 292}];
    for(var i = 0; i < $scope.recommendedTracks.length; i++)
    {
      tracks.push({id: $scope.recommendedTracks[i].id});
    }
    var title = UserObject.get("user_obj").username;
    title += " - Genius Tracklist"
    SC.post('/playlists', {
      playlist: { title: title, tracks: tracks }
    });
    $scope.hasMadePlaylist = true;
    */
    });
  }
}

$scope.likeTrack = function()
{
  SC.connect().then(function() {
  var stringToPass = "/me/favorites/";
  stringToPass += $scope.recommendedTracks[$scope.currentTrackIndex].id;
  //stringToPass += "&oauth_token=1-242668-228144662-7534945a1000f";
  SC.put(stringToPass);
  console.log("went through");
});
}

$scope.muteUnmute = function(id)
{
  $scope.activeSong = document.getElementById(id);
  if($scope.activeSong.volume != 0)
  {
    $scope.volumeUpdate(0);
    $scope.show_mute = false;
  }
  else
  {
    $scope.volumeUpdate(100);
    $scope.show_mute = true;
  }
}

$scope.playPause = function(id,cond){
  document.getElementById("keyCatchDiv").focus();
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

$scope.skipTo = function(inc)
{
  $scope.activeSong.currentTime = ($scope.activeSong.duration / 10) * inc;
  $scope.updateTime();
}

$scope.skipBack = function()
{
  document.getElementById("keyCatchDiv").focus();
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
  document.getElementById("keyCatchDiv").focus();
    var currentSeconds = (Math.floor($scope.activeSong.currentTime % 60) < 10 ? '0' : '') + Math.floor($scope.activeSong.currentTime % 60);
    var currentMinutes = Math.floor($scope.activeSong.currentTime / 60);
    //Sets the current song location compared to the song duration.
    document.getElementById('songTime').innerHTML = currentMinutes + ":" + currentSeconds + ' / ' + Math.floor($scope.activeSong.duration / 60) + ":" + (Math.floor($scope.activeSong.duration % 60) < 10 ? '0' : '') + Math.floor($scope.activeSong.duration % 60);


    //Fills out the slider with the appropriate position.
    var percentageOfSong = ($scope.activeSong.currentTime/$scope.activeSong.duration);
    var factor = document.getElementById('songSlider').getBoundingClientRect().width;
    var percentageOfSlider = factor * percentageOfSong;
    //console.log("prct of slider: " + percentageOfSlider);
    //Updates the track progress div.
    document.getElementById('trackProgress').width = Math.round(percentageOfSlider) + "px";
    document.getElementById('trackProgress').style.width = Math.round(percentageOfSlider) + "px";
    //document.getElementById('trackProgress').style.height = document.getElementById('songSlider').height + "px";
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
    var songSliderWidth = obj.getBoundingClientRect().width;
    var evtobj=window.event? event : e;
    var parent = document.getElementById("waveContainer");
    clickLocation =  (evtobj.layerX - parent.offsetLeft);
    var percentage = (clickLocation/songSliderWidth);
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
    $scope.player_loafded = true;
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
     $scope.show_prog_bar = false;
      //console.log("finished Playing");
      
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
    document.getElementById("trackProgress").style.width = "0px";
    $scope.playingTrack = track;
    for(var i = 0; i < $scope.recommendedTracks.length; i++)
    {
      if(track.id == $scope.recommendedTracks[i].id)
      {
        $scope.currentTrackIndex = i;
      }
    }
    $scope.currentSoundCloudLink = "https://w.soundcloud.com/icon/?url=http%3A%2F%2Fsoundcloud.com%2F";
    $scope.currentSoundCloudLink += track.user.permalink;
    $scope.currentSoundCloudLink += "/";
    $scope.currentSoundCloudLink += track.permalink;
    $scope.currentSoundCloudLink += "&color=orange_white&size=64 style=width: 64px; height: 64px;"
    document.getElementById("scLink").src = $scope.currentSoundCloudLink;
    console.log(track);
    //src="http://api.soundcloud.com/tracks/148976759/stream?client_id=a06eaada6b3052bb0a3dff20329fdbf9"
    var trackStream = "http://api.soundcloud.com/tracks/";
    trackStream += track.id;
    trackStream += "/stream?client_id=";
    trackStream += CLIENT_ID;//"a06eaada6b3052bb0a3dff20329fdbf9";
    var simplePlayer = document.getElementById("song");
    simplePlayer.src = trackStream;
    $scope.show_prog_bar = true;
    $scope.play('song');
  }

  $scope.editCriteria = function()
  {
    $scope.initialCalc = false;
    //ProcessCollectionsObject.clear_();
    //$scope.fav_icons = [];
    //$scope.recommendedTracks = [];
    //UserObject.set("favorites", null);
    //$scope.retrieveLikes();
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
        $scope.show_fav_selection = true;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        /*   
        $scope.loading = true;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        */
        break;
      case "search_criteria":
        console.log("SEARCH_CRITERIA");
        /*
        $scope.loading = false;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = true;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        */
        break;
      case "results":
        console.log("RESULTS");
         $scope.loading = false;
        $scope.show_recs = true;
        $scope.show_tracks = true;
        $scope.show_fav_selection = true;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = true;
        /*
        $scope.loading = false;
        $scope.show_recs = true;
        $scope.show_tracks = true;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = true;
        */
        break;
      case "empty_profile":
        console.log("EXCEPTION");
        $scope.loading = false;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        $scope.$apply(function () {
          $scope.show_recs = false;
      });

        /*
        $scope.loading = false;
        $scope.show_recs = false;
        $scope.show_tracks = false;
        $scope.show_fav_selection = false;
        $scope.show_profile = true;
        $scope.show_general_ui = true;
        $scope.show_player = false;
        */
        break;
      default:
        $scope.loading = true;
        $scope.show_recs = true;
        $scope.show_tracks = true;
        $scope.show_fav_selection = true;
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
      }
    }
    var track_cache = SessionCache.getTracks();
    for(var i = 0; i < track_cache.length; i++)
    {
      if(track.id == track_cache[i])
      {
        return false;
      }
    }
    var blacklist_cache = SessionCache.getBlacklist();
    if(blacklist_cache.length > 0)
    {
      for(var i = 0; i < blacklist_cache.length; i++)
      {
        if(track.user_id == blacklist_cache[i])
        {
          console.log("found a blacklist item: ");
          console.log(track);
          return false;
        }
      }
    }
    return true;
  }


  $scope.startCalculation = function()
  {
    if($scope.allowCalculation == false)
      return;
    console.log("hello?");
    //clearInterval(tt);   
    $scope.functIter = 0;
    if($scope.initialCalc)
    {
      tt=setInterval(function(){startTime()},1000);
      $scope.initialCalc = false;
    }
    else
    {
      //NEEDS CONDITION TO ONLY CALL IF FAV_ICONS IS OPEN
      $scope.modalInstance.dismiss();
    }
    console.log("favs to use:");
    console.log($scope.selected_favorites);
    UserObject.set("favs_to_use", $scope.selected_favorites);
    max_artists_computed = $scope.selected_favorites.length;
    //$scope.done_picking_favs = false;
    $scope.hasMadePlaylist = false;
    $scope.UI_states("generating");
    $scope.artistList($scope.timedOut);
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

   $scope.selectAllIcons = function(cond)
  {
    $scope.selected_favorites = [];
    for(var i = 0; i < $scope.fav_icons.length; i++)
    {
      $scope.fav_icons[i].checked_ = cond;
      if(cond == true)
      {
        $scope.selected_favorites.push($scope.fav_icons[i].icon);
      }
    }
    if(cond == true)
    {
      $scope.toggleSelect = false;
      $scope.allowCalculation = true;
      $scope.default_checked = true;
      if(document.getElementById("selectionToggleBtn"))
        document.getElementById("selectionToggleBtn").innerHTML = "Deselect All";
    }
    else if(cond == false)
    {
      $scope.toggleSelect = true;
      $scope.allowCalculation = false;
      $scope.default_checked = false;
      if(document.getElementById("selectionToggleBtn"))
        document.getElementById("selectionToggleBtn").innerHTML = "Select All";
    }
    console.log("selected_favorites after SELECT ALL " + cond + ": ");
    console.log($scope.selected_favorites);
    console.log("fav_icons after SELECT ALL " + cond + ": ");
    console.log($scope.fav_icons);

  }

  $scope.randomIcons = function()
  {
    console.log("called");
    $scope.selected_favorites = [];
    for(var i = 0; i < $scope.fav_icons.length; i++)
    {
      $scope.fav_icons[i].checked_ = false;
    }
    for(var i = 0; i < $scope.fav_icons.length; i++)
    {
      var rand = Math.random();
      if(rand >= 0.5)
      {
        $scope.fav_icons[i].checked_ = true;
        $scope.selected_favorites.push($scope.fav_icons[i].icon);
      }
    }
    if($scope.selected_favorites.length > 0)
    {
      $scope.allowCalculation = true;
    }
    console.log("Selected favs after random method:");
    console.log($scope.selected_favorites);
  }  

  $scope.toggleChecked = function(ind,cond)
  {
    console.log($scope.fav_icons[ind]);
    if(cond == true)
    {
      console.log("handing checked == true");
      $scope.selected_favorites.push($scope.fav_icons[ind].icon);
    }
    else if(cond == false)
    {
      console.log("handling checked == false");
      var index = $scope.selected_favorites.indexOf($scope.fav_icons[ind]);
      $scope.selected_favorites.splice(index,1);
    }
    if($scope.selected_favorites.length == 0)
    {
      $scope.allowCalculation = false;
    }
    else
    {
      if($scope.allowCalculation == false)
        $scope.allowCalculation = true;
    }
    console.log("updated inclusion list:");
    console.log($scope.selected_favorites);
    //$scope.fav_icons[ind].checked = $scope.fav_icons[ind].checked === false ? true: false;
  }


/*
  $scope.updateChecked = function(track,ind)
  {
    console.log("update checked called");
    if(track.checked_ == true)
      $scope.selected_favorites.push(track.icon);
    else if(track.checked_ == false)
    {
      var index = $scope.selected_favorites.indexOf(track.icon);
      $scope.selected_favorites.splice(index,1);
    }
    if($scope.selected_favorites.length == 0)
    {
      $scope.allowCalculation = false;
    }
    else
    {
      if($scope.allowCalculation == false)
        $scope.allowCalculation = true;
    }
    $scope.fav_icons[ind].checked_ = !$scope.fav_icons[ind].checked_;
  }
*/

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
    $scope.loadingStage = 7;
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
    document.getElementById("resultsScroll").scrollTop = 0;
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
          //console.log('execution time for ' + $scope.loading_text + ': ' + time);


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
    $scope.loadingStage = 6;
    var recArtists = ProcessCollectionsObject.get("rec_artists_list");
    var masterList = [];
    var p = 0;
    var i = 0;
    var extra_track_count = 0;
    var max_tracks_local = max_tracks_per_rec;
    $scope.recommendedTracks = [];
    for(i = 0; i < max_recs_computed; i++)
    {
      //console.log("i: " + i);
      if(recArtists[i].OVERLAP == "false" && max_artists_computed > 1)
      {
        extra_track_count ++;
        p++;
        //console.log("p: " + p);
        continue;
      }

      var stringToPass = "/users/" + recArtists[i].permalink + "/tracks";
      var myDataPromise = Retrieve.getData(stringToPass);
      myDataPromise.then(function(responseTracks)
      {  
        $scope.detailed_loading_text = p + "/" + max_recs_computed;
        document.getElementById("detailed_loading_text").innerHTML = $scope.detailed_loading_text;
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
        {
          masterList.push(miniTracklist[l]);
          $scope.masterListBackup = masterList;
        }
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
          //console.log('execution time for ' + $scope.loading_text + ': ' + time);
          //DEBUG_TIMING
          $scope.masterListBackup = [];
          $scope.embed(masterList);
        }
        $scope.recommendedTracks = masterList;
        
      });
    }
  }

  function startTime()
  {
    if($scope.loading == true)
    {
      if($scope.lastLoadingStage != $scope.loadingStage)
      {
        //console.log("loadstage changed to " + $scope.loadingStage);
        tt = null;
        counter = 1;
      }
      else
      {
        var max_time_allowed = 40;
        switch($scope.loadingStage)
        {
          case 3:
            max_time_allowed = $scope.DEBUG_fav_count/2.5;
            break;
          case 4:
            max_time_allowed = $scope.DEBUG_max_count/10;
            break;
          case 6:
            max_time_allowed = 10;
            break;
          default:
            max_time_allowed = 45;
            break;
        }
        console.log(max_time_allowed + ' : loadingStage' + $scope.loadingStage);
        if(counter >= max_time_allowed) 
        {
          //clearInterval(tt);
          //console.log("TOOK TOO LONG (" + counter + " SECONDS) FOR STAGE " + $scope.loadingStage);
          $scope.timedOut = true;
          switch($scope.loadingStage)
          {
            case 3:
              console.log("timeFallbackStage3");
              $scope.fallbackStage3();
              break;
            case 4:
              console.log("timeFallbackStage4");
              $scope.fallbackStage4();
              break;
            case 6:
              console.log("timeFallbackStage6");
              $scope.fallbackStage6();
              break;
            default:
              console.log("Timed Out");
              break;
          }
          counter = 1;
        } 
        else 
        {
          counter++;
        }
      }
      $scope.lastLoadingStage = $scope.loadingStage;
    }
    else
    {
      counter = 1;
      //clearInterval(tt);
    }
  }
  $scope.fallbackStage3 = function()
  {
    $scope.earlyFunctIter++;
    ProcessCollectionsObject.set("liked_artists_fav_lists", $scope.favoritesListsBackup);
    $scope.favoritesListsBackup = [];
    $scope.getListArtists();
  }

  $scope.fallbackStage4 = function()
  {
    $scope.functIter++;
    ProcessCollectionsObject.set("sec_gen_liked_artists", $scope.artistsListToPassBackup);
    $scope.artistsListToPassBackup = [];
    $scope.combineAndCompare();
  }

  $scope.fallbackStage6 = function()
  {
    $scope.masterListBackup.sort(function(a,b) {return (a.COMP_SCORE < b.COMP_SCORE) ? 1 : ((b.COMP_SCORE < a.COMP_SCORE) ? -1 : 0);} ); 
    ProcessCollectionsObject.set("rec_track_list", $scope.masterListBackup);
    $scope.recommendedTracks = $scope.masterListBackup;
    $scope.embed($scope.masterListBackup);
    $scope.masterListBackup = [];
  }
  
  $scope.combineAndCompare = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading_text = "comparing recommendation lists";
    $scope.loadingStage = 5;
    document.getElementById("loading_text").innerHTML = $scope.loading_text;

    var allArtistsList = ProcessCollectionsObject.get("sec_gen_liked_artists");
    var masterArtistList = [];
    console.log(allArtistsList.length);
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
        //IMPORTANT
        result.SCORE = result.FREQ + (result.FREQ / result.followings_count);
      }
      else
      {
        currentArtist.OVERLAP = "false";
        masterArtistList.push(currentArtist);
      }
    }
    //IMPORTANT
    masterArtistList.sort(function(a,b) {return (a.FREQ < b.FREQ) ? 1 : ((b.FREQ < a.FREQ) ? -1 : 0);} ); 
    //masterArtistList.sort(function(a,b) {return (a.SCORE < b.SCORE) ? 1 : ((b.SCORE < a.SCORE) ? -1 : 0);} ); 
    //DEBUG_TIMING
    var end = new Date().getTime();
    var time = end - start;
    //console.log('execution time for ' + $scope.loading_text + ': ' + time);
    //DEBUG_TIMING

    ProcessCollectionsObject.set("rec_artists_list", masterArtistList);
    $scope.getTopTracks();
  }
  $scope.getListArtists = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loadingStage = 4;
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
          $scope.DEBUG_max_count = max_count; 
          myDataPromise.then(function(responseArtists)
          { 
            p++;
            if($scope.functIter > 0)
            {
              return;
            }
            $scope.detailed_loading_text = p + "/" + max_count;
            document.getElementById("detailed_loading_text").innerHTML = $scope.detailed_loading_text;
            artistsListToPass.push(responseArtists);
            $scope.artistsListToPassBackup = artistsListToPass;
            if(p == max_count)
            {
              ProcessCollectionsObject.set("sec_gen_liked_artists", artistsListToPass);
              //DEBUG_TIMING
              var end = new Date().getTime();
              var time = end - start;
              //console.log('execution time for ' + $scope.loading_text + ': ' + time);
              //DEBUG_TIMING
              $scope.artistsListToPassBackup = [];
              $scope.combineAndCompare();
            }
          });
        }
      }    
    }
  }


  $scope.alternateSearch = function(artistObj)
  {
      var pseudoFavList = [];
      var stringToPass = "/users/" + artistObj.id + "/followings";
      var myDataPromise = Retrieve.getData(stringToPass, artistObj.username, liked_artists_max_favlist_length);
      
      return myDataPromise.then(function(responseFollowings)
      { 
        responseFollowings = responseFollowings.collection;
        var p = 0;
        for(var i = 0; i < responseFollowings.length; i++)
        {
          var localStringToPass = "/users/" + responseFollowings[i].id + "/tracks";
          var nextDataPromise = Retrieve.getData(localStringToPass, artistObj.username, liked_artists_max_favlist_length);
          return nextDataPromise.then(function(responseTracks)
          {
            p++;
            pseudoFavList.push(responseTracks[0]);
            if(p == responseFollowings.length)
            {
              return pseudoFavList;
            }
          });
        }
      });
  }

  $scope.getFavoritesLists = function()
  {
    //DEBUG_TIMING
    var start = new Date().getTime();
    //DEBUG_TIMING

    $scope.loading_text = "fetching artists fav lists";
    document.getElementById("loading_text").innerHTML = $scope.loading_text;
    $scope.loadingStage = 3;
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
    $scope.DEBUG_fav_count = max_artists_computed;
    for(i = 0; i < max_artists_computed; i++)
    {
      var stringToPass = "/users/" + artistsSaved[i].id + "/favorites";
      console.log("MAX FAVLIST LEN: " + liked_artists_max_favlist_length);
      var myDataPromise = Retrieve.getData(stringToPass, artistsSaved[i].username, liked_artists_max_favlist_length);
      myDataPromise.then(function(responseFavorites)
      { 
        var favListToPush = responseFavorites;
        if(responseFavorites.length == 0 /*&& max_artists_computed == 1*/)
        {
          var pseudoFavList = [];
          var stringToPass = "/users/" + artistsSaved[p].id + "/followings";
          var myDataPromise = Retrieve.getData(stringToPass, artistsSaved[p].username, liked_artists_max_favlist_length);          
          myDataPromise.then(function(responseFollowings)
          { 
            responseFollowings = responseFollowings.collection;
            var b = 0;
            for(var q = 0; q < responseFollowings.length; q++)
            {
              var localStringToPass = "/users/" + responseFollowings[q].id + "/tracks";
              var nextDataPromise = Retrieve.getData(localStringToPass, artistsSaved[p].username, liked_artists_max_favlist_length);
              nextDataPromise.then(function(responseTracks)
              {
                b++;
                if(responseTracks.length > 0 && responseTracks != null)
                  pseudoFavList.push(responseTracks[0]);
                if(b == responseFollowings.length)
                {
                  p++;
                  
                  if($scope.earlyFunctIter > 0)
                  {
                    //console.log("hunch was right");
                    return;
                  }
                  else
                  {
                    $scope.detailed_loading_text = p + "/" + max_artists_computed;
                    document.getElementById("detailed_loading_text").innerHTML = $scope.detailed_loading_text;
                    //console.log("alternateSearch");
                    favListToPush = pseudoFavList;
                    favoritesLists.push(favListToPush);
                    $scope.favoritesListsBackup = favoritesLists;
                    if(p == max_artists_computed)
                    {
                      if($scope.earlyFunctIter > 0)
                      {
                        //console.log("hunch was right");
                        return;
                      }
                      else
                      {
                        ProcessCollectionsObject.set("liked_artists_fav_lists", favoritesLists);
                        //DEBUG_TIMING
                        var end = new Date().getTime();
                        var time = end - start;
                        //console.log('execution time for ' + $scope.loading_text + ': ' + time);
                        //DEBUG_TIMING
                        $scope.favoritesListsBackup = [];
                        $scope.getListArtists();
                      }
                    }
                  }
                  //ProcessCollectionsObject.set("liked_artists_fav_lists", favoritesLists);

                  //DEBUG_TIMING
                  //var end = new Date().getTime();
                  //var time = end - start;
                  //console.log('execution time for ' + $scope.loading_text + ': ' + time);
                  //DEBUG_TIMING

                  //$scope.getListArtists();
                }
              });
            }
          });
        }  
        else
        {
          p++;
          favoritesLists.push(favListToPush);
          $scope.favoritesListsBackup = favoritesLists;
          //console.log(p);
          $scope.detailed_loading_text = p + "/" + max_artists_computed;
          document.getElementById("detailed_loading_text").innerHTML = $scope.detailed_loading_text;
        }  
        if(p == max_artists_computed)
        {
          ProcessCollectionsObject.set("liked_artists_fav_lists", favoritesLists);
            
          //DEBUG_TIMING
          var end = new Date().getTime();
          var time = end - start;
          //console.log('execution time for ' + $scope.loading_text + ': ' + time);
          //DEBUG_TIMING
          $scope.favoritesListsBackup = [];
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

    $scope.loadingStage = 2;

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
      liked_artists_max_favlist_length = 20;//Math.floor(Math.random() * (20 - 8 + 1)) + 8;
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
          $scope.detailed_loading_text = p + "/" + len;
          document.getElementById("detailed_loading_text").innerHTML = $scope.detailed_loading_text;
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
          //console.log("liked artists: ");
          //console.log(likedArtists);
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
            //console.log('execution time for ' + $scope.loading_text + ': ' + time);
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
    $scope.loadingStage = 1;
    //console.log("CRUDE FAV COUNT: ");
    //console.log(UserObject.get("user_obj").public_favorites_count);
    SC.get(stringToPass, {limit: 150}).then(function(favs) 
    {
        //console.log("USEABLE FAVS COUNT: ");
        //console.log(favs.length);
        //UserObject.set_fav_count(favs.length);
        if(favs.length == 0)
        {
          console.log("no favs");
          $scope.noFavorites();
          return;
        }
        UserObject.set("favorites", favs);  

        //$scope.$apply(function () {
        for(var i = 0; i < favs.length; i++)
        {
          var new_icon = {checked_ : false, icon : favs[i]};
          $scope.fav_icons.push(new_icon);
        }
        $scope.$apply(function () {
          $scope.fav_icons;
        });
        //$scope.artistList();

        //DEBUG_TIMING
        var end = new Date().getTime();
        var time = end - start;
        //console.log('execution time for ' + $scope.loading_text + ': ' + time);

        if($scope.initialCalc == true)
        {
          //console.log("INITIAL");
          UserObject.set("favs_to_use", favs);
          $scope.selectAllIcons(true);
          $scope.startCalculation();
        }
        //DEBUG_TIMING
      });
  }
  var init = function () 
  {

    document.getElementById("keyCatchDiv").focus();
    /*
    var saved = localStorage.getItem("user_obj");
    var artistObj = (localStorage.getItem('user_obj') !== null) ? JSON.parse($scope.saved) : [ {text: 'Learn AngularJS', done: false}, {text: 'Build an Angular app', done: false} ];
  localStorage.setItem('user_obj', JSON.stringify($scope.artistObj));
*/
    console.log(localStorage);
    console.log("retrieved obj: ");
    var artistObj = JSON.parse(localStorage.getItem('userObject'));//JSON.parse($localStorage['userObject'] || '{}');
    UserObject.set("user_obj",artistObj);
    console.log(artistObj);
    //console.log(UserObject.get("user_obj"));
    //var artistObj = $localStorage.userObject;
    //var artistObj = UserObject.get("user_obj");
    avatarPath = artistObj.avatar_url;
    avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
    var doc = document.getElementById("avatar_img");
    doc.src = avatarPath;
    document.getElementById("artistLabel").innerHTML = UserObject.get("user_obj").username;
    $scope.UI_states("generating");
    $scope.retrieveLikes();
  };
  init();
});















app.controller('HomeCtrl', function($scope, $state, UserObject, Retrieve, Embed, ProcessCollectionsObject, FullReset, GlobalFunctions) 
{
  console.log("HOME CTRL CALLED");
  var DEBUG = true;
  var CLIENT_ID = 'a06eaada6b3052bb0a3dff20329fdbf9';
  var REDIRECT_URI = 'http://www.geniustracklist.com/callback.html';
  if(DEBUG == true)
  {
    CLIENT_ID = '0c98c2110c32313f674e6a18eec6eb93'; //'a06eaada6b3052bb0a3dff20329fdbf9';
    REDIRECT_URI = 'http://localhost:8000/www/callback.html'; 
  }

  SC.initialize({
    client_id: CLIENT_ID, //' a06eaada6b3052bb0a3dff20329fdbf9'
    redirect_uri: REDIRECT_URI, //'http://www.geniustracklist.com/callback.html'
    //access_token: $cookieStore.get('scAuth'),
    scope: 'non-expiring'
  });

  $scope.DEBUG = DEBUG;
  $scope.GlobalFunctions = GlobalFunctions;
  $scope.UserObject = UserObject;
  $scope.input_suggestions = [];
  $scope.searchText = "";
  $scope.show_suggestions = true;
  $scope.user_loading_wheel = false;
  $scope.user_no_results = false;
  var input = document.getElementById('searchField');
  var curr_input = "";

  $scope.loginUser = function()
  {
    SC.connect().then(function() {
    return SC.get('/me');


  }).then(function(me) {
    console.log(me);
    UserObject.set("full_user_profile", me);
    UserObject.set("user_obj", me);
    var user_id = UserObject.get("user_obj").id;
     var stringToPass = "/users/" + UserObject.get("user_obj").id;
        var myDataPromise = Retrieve.getData(stringToPass);
        myDataPromise.then(function(artistObj)
        {
          UserObject.set("user_obj", artistObj);
          document.getElementById("searchField").value = "";
          var objToStore = JSON.stringify(artistObj);
          localStorage.setItem('userObject', objToStore);
          localStorage.setItem('loggedIn', "true");
          $state.go('recs');
        }); 
  });
    
  }


    $scope.GetUser = function () 
    {  
      var stringToPass = "/resolve.json?url=http://soundcloud.com/";
      search_input = $scope.UserObject.get("user_obj").permalink;
      stringToPass += search_input;
      stringToPass += "&client_id=";
      stringToPass += CLIENT_ID; //a06eaada6b3052bb0a3dff20329fdbf9";

      //console.log("str to pass: " + stringToPass);
      SC.get(stringToPass).then(function(artistObj)
      {
        UserObject.set("user_obj", artistObj);
        document.getElementById("searchField").value = "";
        var objToStore = JSON.stringify(artistObj);
        //$localStorage.userObject = objToStore;    
        localStorage.setItem('userObject', objToStore);
        localStorage.setItem('loggedIn', "false");
        $state.go('recs');
    });

}

$scope.autoCompleteUsername = function(input)
{
    if(input)
    {
      $scope.user_no_results = false;
      console.log("called w/ input");
      if(input.length >= 3)
      {
        $scope.user_loading_wheel = true;
        this.show_suggestions = true;

      //document.getElementById('autocomplete_list').style.visibility = "visible";

      $scope.input_suggestions = [];
      SC.get('/users', {q: input, limit: 200, track_count: {from: 2}}).then(function(users) 
      {
        $scope.input_suggestions = users;
          $scope.$apply(function () {
                      if(users.length == 0)
          {
            $scope.user_loading_wheel = false;
            $scope.user_no_results = true;
          }
          else
          {
            $scope.user_loading_wheel = false;
            $scope.user_no_results = false;
          }
          });
    });
    }
    else
    {
      $scope.user_loading_wheel = false;
      $scope.input_suggestions = [];
      $scope.show_suggestions = false;
      $scope.user_no_results = false;
    }
  }
  else
  {
    $scope.user_loading_wheel = false;
    $scope.input_suggestions = [];
    $scope.show_suggestions = false;
    $scope.user_no_results = false;
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
    //document.getElementById("autocomplete_list").attributes[1].nodeValue = false;
    $scope.show_suggestions = false;
    $scope.input_suggestions = [];
    $scope.GetUser();
}

$scope.newUser = function()
  {
    UserObject.clear_();
    $scope.searchText = "";
    $scope.show_suggestions = true;
    $scope.loading_text = "";

  }

  $scope.getIcon = function(url)
  {
    if(url == null)
    {
      console.log("failed icon!");
      return "http://a1.sndcdn.com/images/default_avatar_large.png?1469110696";
    }
    else
      return url;
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

  var init = function () 
{

  window.addEventListener('error', function(e) {
    console.log(e);
    console.log(e.target.src);
    e.target.src = e.target.src;
    $scope.$apply(function () {
            $scope.message = "Timeout called!";
          });
}, true);
  

  console.log("init");
   if(FullReset.get() == true)
   {
      window.location.reload(true)
    }
    else
    {
      input.focus();
      input.select();
    }

};

  init();

});


