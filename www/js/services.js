angular.module('starter.services', [])


.factory('Retrieve', function($http) {
    //var user_id = 0;
    var getData = function(str) {
      //user_id = i;

        //return SC.get("/users/" + user_id, {limit: 100}).then(function(artist_obj) 
        return SC.get(str, {limit:200}).then(function(data_) 
        {
          //return $http({method:"GET", url:"/my/url"}).then(function(result){
          // What we return here is the data that will be accessible 
          // to us after the promise resolves
            return data_;
        });
    };

    return { 
      getData: getData 
    };
})



.factory("RecommendedArtistObjects", function()
{
  var recommendedArtists = null;
  return{
    set: function(ob_)
    {
      recommendedArtists = obj_;
    },
    get: function()
    {
      return recommendedArtists;
    }
  };
})

.factory("ArtistObjects", function() {

  var firstArtist = null;
  var secondArtist = null;

  return {
    setFirst: function(obj_) {
      firstArtist = obj_;
    },
    getFirst: function()
    {
      return firstArtist;
    },
    setSecond: function(obj_) {
      secondArtist = obj_;
    },
    getSecond: function()
    {
      return secondArtist;
    }
  };
})



.factory("FollowingObjects", function() {

  var following = null;

  return {

    set: function(obj_) {
      following = obj_;
    },
    get: function()
    {
      return following;
    }
  };
})

.factory("UserObject", function() {

  var user = null;

  return {
    set: function(obj_) {
      user = obj_;
    },
    get: function()
    {
      return user;
    }
  };
})


.factory("UserFavs", function() {

  var favs = null;
  var ind_ = 0;
  return {
    set: function(obj_) {
      favs = obj_;
    },
    get: function()
    {
      return favs;
    },
    setInd: function(ind)
    {
      ind_ = ind;
    },
    getInd: function()
    {
      return ind_
    }
  };
})


.factory("UserArtists", function() {

  artists = null;
  return {
    set: function(obj_) {
      artists = obj_;
    },
    get: function()
    {
      return artists;
    },
  };
})


.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});


