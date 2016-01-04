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

app.controller('AppCtrl', function ($rootScope, $scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('pages/filter.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.closeFilter = function () {
        $scope.modal.hide();
    };
    $scope.filter = function () {
        $scope.modal.show();
    };

})


app.controller('PantryCtrl', ["$scope", "$http", "$rootScope", "$timeout", function ($scope, $http, $rootScope, $timeout) {
    if (typeof $rootScope.inventory === 'undefined') {
        //Initialize variables if not already existent
        $rootScope.inventory = [];
        $rootScope.excludeArray = [];
        $rootScope.recipeArray = [];
        $scope.url = "http://www.recipepuppy.com/api/?i=";
        $scope.ingredient = 'Enter Ingredient Here!'; 
        $rootScope.pageCounter = 1;
        $rootScope.maxMissing = 4;
        $rootScope.excludeIngredient = 'Enter Here!'
        $rootScope.excludeToggle = false
    }
    $scope.ingredient = 'Enter Ingredient Here!';
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true
    $scope.add = function() {
        if ($rootScope.inventory.indexOf(this.ingredient) < 0 && this.ingredient!= '' && this.ingredient != 'Enter Ingredient Here!') {
            $rootScope.inventory.push(this.ingredient);
            this.ingredient = ''; //Resets text box
            $rootScope.pageCounter = 1;
            $rootScope.recipeArray = [];
        }
    };
    $rootScope.excludeAdd = function() {
        if ($rootScope.excludeArray.indexOf(this.excludeIngredient) < 0 && this.excludeIngredient != '' && this.excludeIngredient != 'Enter Here!') {
            $rootScope.excludeArray.push(this.excludeIngredient);
            this.excludeIngredient = ''; //Resets text box
            $rootScope.pageCounter = 1
        }
    };
    $scope.deleteIngredient = function ($index) {
        $rootScope.inventory.splice($index, 1);
    }
    $rootScope.deleteExcludeIngredient = function($index) {
        $rootScope.excludeArray.splice($index, 1);
    }
    $scope.getData = function () {
        $scope.url = 'http://www.recipepuppy.com/api/?i=';
        $rootScope.inventory.forEach(function (item) {
            $scope.url += (item + ',')
        })
        $http.get($scope.url.slice(0, -1) + '&p=' + $rootScope.pageCounter)
            .success(function (data) {
            $rootScope.pageCounter += 1
            data.results.forEach(function (recipe) { //Eval. each recipe
                recipe.ingredientArray = recipe.ingredients.split(", ");
                if (recipe.thumbnail === '') {
                    //Assigns recipe thumbnail if it doesn't come with one
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
                //Add ingredient to missingIngredient array if not in user inv.
                recipe.ingredientArray.forEach(function (item) {
                    if (!recipe.presentIngredients[item]) {
                        recipe.missingIngredients.push(item);
                    }
                });
                //Displays 'Nothing!' if recipe has no missing ingredients 
                if (recipe.missingIngredients.length === 0) { 
                    recipe.missingIngredients.push('Nothing!')
                }
                //Display's recipe to page
                $rootScope.recipeArray.push(recipe);
            });
            //Removes recipes with user's undesired ingredients
            if ($rootScope.excludeArray.length > 0) {
                for(i=$rootScope.recipeArray.length-1; i>=0; i--) {
                    $rootScope.excludeArray.forEach(function(excludeIngredient) {
                        console.log($rootScope.recipeArray[i])
                        if($rootScope.recipeArray[i].ingredients.toLowerCase().indexOf(excludeIngredient.toLowerCase()) != -1) {
                            $rootScope.recipeArray.splice(i,1)
                        }
                    })
                }
            }
            //Eliminates recipes with too many missing ingredients
            for (i=$rootScope.recipeArray.length-1; i>=0; i--) {
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
        //Open links in cordova's InAppBrowser on mobile devices
        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone()) {
            window.open = cordova.InAppBrowser.open;    
        }
        window.open(link, '_blank', 'location=yes');
    }
    $scope.checkAmount = function() {
        //Populates page with recipes
        if ($rootScope.recipeArray.length < 15) {
            $scope.getData();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    }
}])