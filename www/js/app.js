// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'ngSanitize'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'pages/menu.html',
                controller: 'AppCtrl'
            })
            
            .state('app.recipes', {
                url: '/recipes',
                views: {
                    'menuContent': {

                        templateUrl: 'pages/recipes.html',
                        controller: 'PantryCtrl'
                    }
                }
            })
            
            .state('app.filter', {
                url: '/filter',
                views: {
                    'menuContent': {
                        templateUrl: 'pages/filter.html',
                        controller: 'PantryCtrl'
                    }
                }
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'pages/home.html',
                        controller: function ($ionicHistory, $scope) {
                            $ionicHistory.nextViewOptions({
                                historyRoot: true
                            });
                        }
                    }
                }
            })
            
            .state('app.pantry', {
                url: '/pantry',
                views: {
                    'menuContent': {
                        templateUrl: 'pages/pantry.html',
                        controller: 'PantryCtrl'
                    }
                }
            })
            
            .state('app.about', {
                url: '/about',
                views: {
                    'menuContent': {
                        templateUrl: 'pages/about.html',
                    }
                }
            });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});

app.controller('AppCtrl', function ($rootScope, $timeout, $scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('pages/filter.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the filter modal to close it
    $scope.closeFilter = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.filter = function () {
        $scope.modal.show();
    };

})


app.controller('PantryCtrl', ["$scope", "$http", "$rootScope", "$timeout", function ($scope, $http, $rootScope, $timeout) {
    if (typeof $rootScope.inventory === 'undefined') {
        $rootScope.inventory = []; //User's Ingredients
        $rootScope.excludedInventory = []
        $rootScope.recipeArray = [];
        $scope.url = "http://www.recipepuppy.com/api/?i="; //Initial URL
        $rootScope.excludedIngredient = 'Exclude ingredients?'
        $scope.ingredient = 'Enter Ingredient Here!'; //Initial content of Input Box
        $rootScope.pageCounter = 1 //Increases api page, incremented upon reaching bottom of page
        $rootScope.maxMissing = 4
    }
    $rootScope.excludeAdd = function() {
        if ($rootScope.excludedInventory.indexOf(this.excludedIngredient) < 0 && this.excludedIngredient != '') {
            $rootScope.excludedInventory.push(this.excludedIngredient);
            this.excludedIngredient = ''; //Resets text box
        }
    }
    $scope.ingredient = 'Enter Ingredient Here!'; //Initial content of Input Box
    $scope.shouldShowDelete = false; //Trash icon setting in pantry add
    $scope.listCanSwipe = true //Trash icon setting in pantry add
    $scope.add = function() {
        if ($rootScope.inventory.indexOf(this.ingredient) < 0 && this.ingredient != '') {
            $rootScope.inventory.push(this.ingredient);
            this.ingredient = ''; //Resets text box
            $rootScope.pageCounter = 1
            $rootScope.recipeArray = []
        }
    };
    $scope.deleteIngredient = function ($index) {
        $rootScope.inventory.splice($index, 1);
    }
    $rootScope.deleteExcludedIngredient = function($index) {
        $rootScope.excludedInventory.splice($index, 1);
    }
    $scope.getData = function () {
        $scope.url = 'http://www.recipepuppy.com/api/?i=';
        $rootScope.inventory.forEach(function (item) {
            $scope.url += (item + ',')
        })
        $http.get($scope.url.slice(0, -1) + '&p=' + $rootScope.pageCounter) //Slices api correctly
            .success(function (data) {
            $rootScope.pageCounter += 1
            data.results.forEach(function (recipe) { //Eval. each recipe
                recipe.ingredientArray = recipe.ingredients.split(", ");
                if (recipe.thumbnail === '') {
                    recipe.thumbnail = 'img/missingThumbnail.png';
                }
                recipe.presentIngredients = {}
                recipe.missingIngredients = []
                $rootScope.inventory.forEach(function (inventoryItem) { //Each user ingred.
                    recipe.ingredientArray.forEach(function (item) { //Each recipe ingred.
                        if (item.toLowerCase().indexOf(inventoryItem.toLowerCase()) != -1) { //Checks if user item is included in recipe at all
                            recipe.presentIngredients[item] = true; //If so, create object of item with value 'true'
                        }
                    })
                })
                recipe.ingredientArray.forEach(function (item) {
                    if (!recipe.presentIngredients[item]) { //if recipe ingred. is not present in user inv.
                        recipe.missingIngredients.push(item); //add recipe ingred. to missing igred. array
                    }
                });
                if (recipe.missingIngredients.length === 0) { 
                    recipe.missingIngredients.push('Nothing!')
                }
                $rootScope.recipeArray.push(recipe);
            });
            for (i=$rootScope.recipeArray.length-1;i>=0;i--) {
                if ($rootScope.recipeArray[i].missingIngredients.length >= $rootScope.maxMissing) {
                    $rootScope.recipeArray.splice(i,1)
                }
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.checkAmount();
            console.log('Get request successful.')
        })
            .error(function (data) {
            $rootScope.pageCounter += 1
            console.log("Get request failed.")
            $scope.$broadcast('scroll.infiniteScrollComplete');

        })
    }
    $rootScope.openLink = function (link) {
        window.open(link, '_blank', 'location=yes');
    }
    $scope.checkAmount = function() {
        if ($rootScope.recipeArray.length < 15) {
            $scope.getData();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    }
}])