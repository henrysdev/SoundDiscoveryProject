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
          console.log("okkkk");
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


