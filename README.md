#Introduction
Welcome! Munch is an open source hybrid app designed by me, using [Ionic](http://ionicframework.com/) and [Apache Cordova](https://cordova.apache.org/). The app presents a user with recipes they can make given their inventory. Recipes are pulled from the [Recipe Puppy API](http://www.recipepuppy.com/about/api/).

#Emulation
1. Install [nodeJS](https://nodejs.org/en/).
2. Install Ionic: `npm install -g ionic` (may require sudo)
1. Clone this repository.
2. Navigate to the project directory.
3. Emulation 
 - In browser: 
      * `npm install gulp`
      * `ionic serve` 
  - On iOS device (**Xcode** required): 
      * `ionic platform add ios`  
      * `ionic emulate ios` 
  - On Android device (**Android Studio** &  [further setup](http://www.debenu.com/kb/create-an-emulator-for-testing-in-android-studio/) (up to step 6) required): 
     * `ionic platform add android`
     * `ionic emulate android`

#Upcoming
Munch is currently on the iOS and Google Play stores, but much more is still to come! Upcoming features include ingredient exclusion, recipe bookmarking, fixing misc. bugs and more! If interested in helping out. be sure to keep an eye out on the issues tab, it will be getting quite a bit of usage ;)

#Contact
Feel free to get in touch with me if you have any questions/comments! I can be reached on here or by <a href="mailto:akoumis1@gmail.com">email</a>.
