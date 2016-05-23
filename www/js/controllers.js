angular.module('starter.controllers', [])


.controller('ChatsCtrl', function($scope, Chats, UserObject) 
{
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'https://soundcloud.com/user-8492062'
  });
  $scope.UserObject = UserObject;
  $scope.searchText = "";
  $scope.show_suggestions = false;
  var avatarPath = "";

  $scope.retrieveLikes = function()
  {
    var stringToPass = "/users/" + UserObject.get().id + "/favorites";
    console.log("boy he bout to do it");
    console.log(stringToPass);
    SC.get(stringToPass, {limit: 100}).then(function(favs) 
    {
        console.log(favs);
    });
  }

  $scope.GetUser = function (search_input) 
  {    
    SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
    {
        console.log(tracks);
    });
 
    this.show_suggestions = false;
    var stringToPass = "/resolve.json?url=http://soundcloud.com/";
      search_input = $scope.UserObject.get().permalink;
    stringToPass += search_input;
    stringToPass += "&client_id=a06eaada6b3052bb0a3dff20329fdbf9";

    SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
    {
        console.log(tracks);
    });
    SC.get(stringToPass).then(function(artistObj)
    {
        console.log(artistObj);
        UserObject.set(artistObj);
        avatarPath = artistObj.avatar_url;
        avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
        var doc = document.getElementById("avatar_img");
        var attr = doc.attributes;
        doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("artistLabel").innerHTML = UserObject.get().username;//ArtistObjects.getFirst().username;
        document.getElementById("searchField").value = "";
        $scope.autoCompleteUsername("a",'1');
    });
    $scope.retrieveLikes();
  }

  $scope.autoCompleteUsername = function(input)
  {
    console.log("auto complete was called");
    console.log(input);
    if(input && input.length >= 3) 
    {
      this.show_suggestions = true;
    
      //document.getElementById('autocomplete_list').style.visibility = "visible";

      $scope.input_suggestions = [];
      SC.get('/users', {q: input, limit: 200, track_count: {from: 2}}).then(function(users) 
      {
        console.log(users);
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
      console.log("reached the else condition");
      $scope.show_suggestions = false;
    }
  }

  $scope.selectUser = function(selectedUser)
  {
    this.show_suggestions = false;
      console.log("selected user:");
      console.log(selectedUser);
      UserObject.set(selectedUser);
      this.show_suggestions = false;
      document.getElementById("searchField").value = selectedUser.username;
      document.getElementById("autocomplete_list").attributes[1].nodeValue = false;
      $scope.show_suggestions = false;
      $scope.input_suggestions = [];
  }
})















.controller('DashCtrl', function($scope, ArtistObjects) {
  SC.initialize({
    client_id: 'a06eaada6b3052bb0a3dff20329fdbf9',
    redirect_uri: 'https://soundcloud.com/user-8492062'
  });
  $scope.ArtistObjects = ArtistObjects;
  $scope.firstSearchText = "";
  $scope.secondSearchText = "";
  $scope.first_show_suggestions = false;
  $scope.second_show_suggestions = false;
  var avatarPath = "";

  SC.get('/tracks').then(function(tracks){
    console.log('0 track: ' + tracks[0].title);
    console.log('1 track: ' + tracks[1].title);
    console.log('2 track: ' + tracks[2].title);
    console.log('3 track: ' + tracks[3].title);
  });

//
//
  $scope.GetUser = function (search_input,artistNum) 
  {
        
    SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
    {
        console.log(tracks);
    });
 
    this.first_show_suggestions = false;
    var stringToPass = "/resolve.json?url=http://soundcloud.com/";
    if(artistNum == "1")
      search_input = $scope.ArtistObjects.getFirst().permalink;
    else
      search_input = $scope.ArtistObjects.getSecond().permalink;
    stringToPass += search_input;
    stringToPass += "&client_id=a06eaada6b3052bb0a3dff20329fdbf9";
    SC.get("/users/" + search_input + "/tracks", {limit: 100}).then(function(tracks) 
    {
        console.log(tracks);
    });
    SC.get(stringToPass).then(function(artistObj)
    {
      if(artistNum == "1")
      {
        console.log(artistObj);
        ArtistObjects.setFirst(artistObj);
        avatarPath = artistObj.avatar_url;
        avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
        var doc = document.getElementById("first_avatar_img");
        var attr = doc.attributes;
        doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("firstArtistLabel").innerHTML = ArtistObjects.getFirst().username;
        document.getElementById("firstSearchField").value = "";
        $scope.autoCompleteUsername("a",'1');
      } 
      else if(artistNum == "2")
      {
        console.log(artistObj);
        ArtistObjects.setSecond(artistObj);
        avatarPath = artistObj.avatar_url;
        avatarPath = avatarPath.replace("-large.jpg","-t500x500.jpg");
        var doc = document.getElementById("second_avatar_img");
        var attr = doc.attributes;
        doc.attributes[2].nodeValue = avatarPath;
        document.getElementById("secondArtistLabel").innerHTML = ArtistObjects.getSecond().username;
        document.getElementById("secondSearchField").value = "";
        $scope.autoCompleteUsername("a",'2');
      }


    });
  }

  $scope.autoCompleteUsername = function(input, artistNum)
  {
    console.log("auto complete was called");
    console.log(input);
    console.log(artistNum);
    if(input && input.length >= 3) 
    {
      if(artistNum == "1")
      {
        this.first_show_suggestions = true;
        this.second_show_suggestions = false;
      }
      else
      {
        this.second_show_suggestions = true;
        this.first_show_suggestions = false;
      }
      //document.getElementById('autocomplete_list').style.visibility = "visible";

      $scope.input_suggestions = [];
      SC.get('/users', {q: input, limit: 200, track_count: {from: 2}}).then(function(users) 
      {
        console.log(users);
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
      console.log("reached the else condition");
      if(artistNum == "1")
      {
        $scope.first_show_suggestions = false;
        $scope.second_show_suggestions = false;
      }
      else
      {
        $scope.second_show_suggestions = false;
        $scope.first_show_suggestions = false;
      }
    }
  }

  $scope.selectUser = function(selectedUser,artistNum)
  {
    this.first_show_suggestions = false;
    if(artistNum == '1')
    {
      console.log("selected user:");
      console.log(selectedUser);
      ArtistObjects.setFirst(selectedUser);
      this.first_show_suggestions = false;
      document.getElementById("firstSearchField").value = selectedUser.username;
      document.getElementById("first_autocomplete_list").attributes[1].nodeValue = false;
      $scope.first_show_suggestions = false;
      $scope.second_show_suggestions = false;
      $scope.input_suggestions = [];
    }
    else if(artistNum == '2')
    {
      console.log("selected user:");
      console.log(selectedUser);
      ArtistObjects.setSecond(selectedUser);
      this.second_show_suggestions = false;
      document.getElementById("secondSearchField").value = selectedUser.username;
      document.getElementById("second_autocomplete_list").attributes[1].nodeValue = false;
      $scope.second_show_suggestions = false;
      $scope.first_show_suggestions = false;
      $scope.input_suggestions = [];
    }
  }

})



.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
