
angular.module('GeniusTracklist', ['ui.router', 'ui.bootstrap', 'angularModalService', 'ui.bootstrap.modal'])

.run(['$state', function ($state) {}])

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
      templateUrl: 'templates/algopage.html'
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
      templateUrl: 'templates/homepage.html',
      controller: "HomeCtrl"
     
    });

});
