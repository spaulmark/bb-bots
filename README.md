--> https://spaulmark.github.io/bb-bots/ <--


BB-bots is a WIP offline big brother simulator similar to https://www.brantsteele.com/bigbrother/ . 

The motivation for this project is that brantsteele is an old website with a difficult UI to use. 
It is painful to set up custom games.
It is difficult to see the relationships the characters have with each other and how they develop throughout the game.
It's hard to follow the logic behind some of the decisions that the characters make.

BB-bots seeks to fix these issues by having setup be as simple as dragging and dropping images or copy-pasting links (with optional names), making a UI that is focused on delivering information in an easy to read way, and revamping the logic used for players to make game descisions.

# TODO #
## Logic ##
* [x] Basic game logic
* [ ] Target & pawn based nominations
* [ ] Better veto logic
* [x] Replace jury equity with "people I can't beat in the finals"
* [ ] Semi-realistic first impressions algorithm
* [ ] Dynamic relationships
* [ ] Complex game logic: Players react to events
* [ ] Complex game logic: Gossip and influences

## Features ##
* [x] Cast X random players button on setup screen
* [x] Click a player to view his/her relationships
* [ ] Power rankings view
* [ ] Cliques view
* [ ] Endgame stats screen & voting table
* [ ] Editable player names
* [ ] Actually making it look nice
* [ ] Custom season builder, customize the twists in the game (Double Eviction, Double HoH, etc.)

## Running Locally ## 
```
npm install
npm start
```
