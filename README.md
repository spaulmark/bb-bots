--> https://spaulmark.github.io/bb-bots/ <--


BB-bots is a WIP offline big brother simulator similar to https://www.brantsteele.com/bigbrother/ . 

You can simulate a game of Big Brother using your own custom cast of images, or use a pre-set cast. It's lots of fun, why not try it out?

# TODO #

## Features ##
* [x] Cast X random players button on setup screen
* [x] Click a player to view his/her relationships
* [x] Power rankings view
* [x] Endgame stats screen & voting table 
* [x] Add pre-set casts for a quick play option 
* [x] Disable power rankings view until Jury
* [ ] Clique factoring <--- current focus
* [ ] Improved deck selection interface 

## Lower Priority Features ##
* [ ] Custom season builder, customize the twists in the game (Double Eviction, Double HoH, etc.)

## Logic ## 
* [x] Basic game logic
* [x] Players take into account who they can beat in the end
* [x] Actual non broken nomination logic
* [ ] Tooltips for nomination/replacement nominee logic
* [ ] Reworked veto logic
* [x] Target & pawn based nominations
* [x] Vote logic post-jury should have more focus on who they can beat
* [ ] Dynamic relationships, log scale relationships, players take into account which friends they can beat, and similarity of opinions with other players.



## Running Locally ## 
```
npm install
npm start
```
