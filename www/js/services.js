angular.module('starter.services', [])

.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])

.factory('StoredEmbedLinks', function() {
  var embedLinks = [];

  return{
    set: function(new_obj)
    {
      embedLinks.push(new_obj);
      console.log(embedLinks);
    },
    get: function(id_)
    {
      /*
      DEBUGGING FOR RETREIEVING STREAM
      console.log("looking for: ");
      console.log(id_);
      console.log(embedLinks);
      */
      for(var i = 0; i < embedLinks.length; i++)
      {
        if(embedLinks[i].trackID == id_)
        {
          console.log(embedLinks[i]);
          return embedLinks[i].streamLink;
          break;
        }
      }
    }
  }
})

.factory('Embed', function($http) {

    var getData = function(track_url) 
    {
      return SC.oEmbed(track_url, { auto_play: false }).then(function(oEmbed) 
      {
        return oEmbed;
      });
    };
    return { getData: getData };
})

.factory('Retrieve', function($http) {
    var getData = function(str, sender) {
        return SC.get(str, {limit:200}).then(function(data_) 
        {
            data_.SENDER = sender;
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


.factory("FavoritesLists", function() {

  var favorites = null;

  return {

    set: function(obj_) {
      favorites = obj_;
    },
    get: function()
    {
      return favorites;
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


