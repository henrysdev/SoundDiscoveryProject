angular.module('GeniusTracklist.services', [])

.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])


.factory('GlobalFunctions', function() {
  return{
  //Knuth Shuffle (not mine)
  shuffle: function(array) 
  {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) 
    {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },


  findById: function(source, id_) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id_ || source[i].user_id === id_) 
    {
      return source[i];
    }
  }
  return null;
  //throw "Couldn't find object with id: " + id;
},

  catchNull: function(src) {
    var defaultUrl = "http://i.stack.imgur.com/5Y4F4.jpg";
    if(src == "" || src == null)
    {
      return defaultUrl;
    }
    else
      return src;

  }

  }
})

.factory('FullReset', function() {
  var full_reset = false;
  return{
    set: function(bool)
    {
      full_reset = bool;
    },
    get: function()
    {
      return full_reset;
    }
  }
})

.factory('SessionCache', function() {
  var recommendedTracks = [];
  var recommendedArtists = [];
  return{
    setList: function(recList)
    {
      for(var i = 0; i < recList.length; i++)
      {
        recommendedTracks.push(recList[i].id);
      }
    },
    set: function(rec)
    {
      recommendedTracks.push(rec.id);
    },
    getTracks: function()
    {
      return recommendedTracks;
    }
  }
})

.factory('StoredEmbedLinks', function() {
  var embedLinks = [];
  var currentIndex = 0;

  return{
    set: function(new_obj)
    {
      embedLinks.push(new_obj);
      //console.log(embedLinks);
    },
    get: function(id_)
    {
      for(var i = 0; i < embedLinks.length; i++)
      {
        if(embedLinks[i].trackID == id_)
        {
          currentIndex = i;
          //console.log(embedLinks[i].streamLink);
          return embedLinks[i].streamLink;
          break;
        }
      }
    },
    getNext: function()
    {
      currentIndex++;
      if(embedLinks.length > currentIndex)
      {
        return embedLinks[currentIndex].streamLink;
      }
    },

    clear_: function()
    {
      embedLinks = [];
    }
    
  }
})

.factory('Embed', function($http) {

    var getData = function(track_url) 
    {
      return SC.oEmbed(track_url, { auto_play: true }).then(function(oEmbed) 
      {
        return oEmbed;
      });
    };
    return { getData: getData };
})

.factory('Retrieve', function($http) {
    var getData = function(str, sender, lim) {
        return SC.get(str, {limit: lim }).then(function successCallback(data_) 
        {
            data_.SENDER = sender;
            return data_;
        },
        function errorCallback(response)
        {
          console.log("caught error");
          $scope.data.error = { message: error, status: status};
          console.log($scope.data.error.status); 
        });
    };

    return { 
      getData: getData 
    };
})


.factory("ProcessCollectionsObject", function()  {

  var liked_artists = null;
  var sec_gen_liked_artists = null;
  var liked_artists_fav_lists = null;
  var rec_artists_list = null;
  var rec_track_list = null;
  

  return {
    set: function(attr_name, val)
    {
      switch(attr_name)
      {
        case "liked_artists":
          liked_artists = val;
          break;
        case "sec_gen_liked_artists":
          sec_gen_liked_artists = val;
          break;
        case "liked_artists_fav_lists":
          liked_artists_fav_lists = val;
          break;
        case "rec_artists_list":
          rec_artists_list = val;
          break;
        case "rec_track_list":
          rec_track_list = val;
          break;
      }
    },
    get: function(attr_name, id_)
    {
      var thing_to_return = null;
      switch(attr_name)
      {
        case "liked_artists":
          thing_to_return = liked_artists;
          break;
        case "sec_gen_liked_artists":
          thing_to_return = sec_gen_liked_artists;
          break;
        case "liked_artists_fav_lists":
          thing_to_return = liked_artists_fav_lists;
          break;
        case "rec_artists_list":
          thing_to_return = rec_artists_list;
          break;
        case "rec_track_list":
          thing_to_return = rec_track_list;
          break;
      }
      return thing_to_return;
    },
    clear_: function()
    {
      liked_artists = null;
      sec_gen_liked_artists = null;
      liked_artists_fav_lists = null;
      rec_artists_list = null;
      rec_track_list = null;
    }
  }
})


.factory("UserObject", function() {

  var full_user_profile = null;
  var user_obj = null;
  var fav_count = 0;
  var favorites = null;
  var following = null;
  var favs_to_use = null;

  return {
    set: function(attr_name, val)
    {
      switch(attr_name)
      {
        case "full_user_profile":
          full_user_profile = val;
          break;
        case "user_obj":
          user_obj = val;
          break;
        case "favorites":
          favorites = val;
          break;
        case "following":
          following = val;
          break;
        case "fav_count":
          fav_count = val;
          break;
        case "favs_to_use":
          favs_to_use = val;
          break;
      }
    },
    get: function(attr_name)
    {
      var thing_to_return = null;
      switch(attr_name)
      {
        case "full_user_profile":
          thing_to_return = full_user_profile;
          break;
        case "user_obj":
          thing_to_return = user_obj;
          break;
        case "favorites":
          thing_to_return = favorites;
          break;
        case "following":
          thing_to_return = following;
          break;
        case "fav_count":
          thing_to_return = fav_count;
          break;
        case "favs_to_use":
          thing_to_return = favs_to_use;
          break;
      }
      return thing_to_return;
    },
    clear_: function()
    {
      full_user_profile = null;
      user_obj = null;
      fav_count = null;
      favorites = null;
      following = null;
      favs_to_use = null;
    }
  };
});


