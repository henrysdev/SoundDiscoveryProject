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
      //console.log(embedLinks);
    },
    get: function(id_)
    {
      for(var i = 0; i < embedLinks.length; i++)
      {
        if(embedLinks[i].trackID == id_)
        {
          //console.log(embedLinks[i]);
          return embedLinks[i].streamLink;
          break;
        }
      }
    },
    clear: function()
    {
      embedLinks.clear();
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


.factory("ProcessCollectionsObject", function()  {

  var liked_artists = null;
  var sec_gen_liked_artists = null;
  var liked_artists_fav_lists = null;

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
      }
      return thing_to_return;
    },
    clear: function()
    {
      liked_artists = null;
      sec_gen_liked_artists = null;
      liked_artists_fav_lists = null;
      embed_links = [];
    }
  }
})


.factory("UserObject", function() {

  var user_obj = null;
  var fav_count = 0;
  var favorites = null;
  var following = null;
  //var user_type = null;

  return {
    set: function(attr_name, val)
    {
      switch(attr_name)
      {
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
      }
    },
    get: function(attr_name)
    {
      var thing_to_return = null;
      switch(attr_name)
      {
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
      }
      return thing_to_return;
    },
    clear: function()
    {
      user_obj = null;
      fav_count = null;
      favorites = null;
      following = null;
    }
  };
});


