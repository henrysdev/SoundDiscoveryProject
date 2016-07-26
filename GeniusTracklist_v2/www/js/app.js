// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('GeniusTracklist', ['ui.router', 'ui.bootstrap', 'angularModalService', 'ui.bootstrap.modal'])


/*
.provider('modalState', function($stateProvider) {
    var provider = this;
    this.$get = function() {
        return provider;
    }
    this.state = function(stateName, options) {
        var modalInstance;
        $stateProvider.state(stateName, {
            url: options.url,
            onEnter: function($uibModal, $state) {
                modalInstance = $uibModal.open(options);
                modalInstance.result['finally'](function() {
                    modalInstance = null;
                    if ($state.$current.name === stateName) {
                        $state.go('^');
                    }
                });
            },
            onExit: function() {
                if (modalInstance) {
                    modalInstance.close();
                }
            }
        });
    };
})
*/
/*
.run(['$state', function ($state) {
   $state.transitionTo('home');
}])
*/
.run(['$state', function ($state) {}])
/*
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
*/
.config(function($stateProvider, /*modalStateProvider,*/ $urlRouterProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $urlRouterProvider.otherwise('/home');
  $stateProvider
  .state('recs', {
      cache: true,
      url: '/recs',
      controller: "RecCtrl",
      /*function($scope, $state) {
            $scope.$state = $state;
            console.log($scope.$state)
        },
        */

      templateUrl: 'templates/tab-recs.html'
    })
.state('callback', {
    cache: false,
    url: '/callback',
    controller: 'CallbackCtrl',
    templateUrl: 'callback.html'
  })
  .state('home', {
      cache: false,
      url: '/home',
      templateUrl: 'templates/tab-account.html',
      controller: "HomeCtrl"
     
    });
  
/*
    modalStateProvider.state('rec.modal1', {
        url: '/modal1',
        templateUrl: 'templates/test.html'
    });
    modalStateProvider.state('rec.modal1.modal2', {
        url: '/modal2',
        templateUrl: 'templates/test.html'
    });
*/
});
