## Big Brother Bots: A Big Brother (US) Simulator ## 

--> https://spaulmark.github.io/bb-bots/ <--

Big Brother Bots is a simulator for the reality show Big Brother.

Choose characters from 300+ collections, or upload your own, then add twists and watch as everyone votes each other out until one winner remains! You can contact me on github or at `Prof. Plum#8114`.

<p align="center">
    <img width="" src="https://spaulmark.github.io/src/bb-bots.png" alt="Preview Image">
</p>

---

## Choose a Cast of Characters ##
![CastingScreen](https://user-images.githubusercontent.com/48075143/161446733-c48996f9-15c8-4427-9a5d-b04b74147a56.png)

Big brother bots has over 300 pre-made casts of characters available to choose from. You can search for the cast of your choice using the search bar (1). Then, select as many casts as you like (2), and then press submit (3). 

---

## Upload your own Characters ##


![Screenshot from 2022-04-03 16-24-51](https://user-images.githubusercontent.com/48075143/161447161-b9344258-2348-4dfa-bd78-d0fcebbd6c67.png)

You can also upload your own images by dragging and dropping them into the screen, or selecting them from your filesystem. If their names don't turn out right, you can edit them using the pencil button. 

---

## Edit a Cast of Characters ##

![random1](https://user-images.githubusercontent.com/48075143/161447573-8c3a1f56-0a45-4640-9505-477ce9a8d81d.png)

**Including characters:** to include a character, click on them to select them. Once you've selected all the characters you want in your simulation, enter the number of players you want in your simulation in the box next to the random button, then click random. **Characters that are selected will never be removed by the random button.**

**Excluding characters:** to delete a character, double click the X on the top of their card. You can also delete characters in bulk by clicking on them and then pressing delete selected. 

---

## Understanding Relationships ##

![legend](https://cmsweb.utsc.utoronto.ca/c46blog-f20/wp-content/uploads/2020/11/legend-768x458.png)

Popularity is the average of a player’s relationships, and dictates the background colour of the card. # of people targeting me indicates the number of players that would nominate this player as an initial nomination if they won HoH. 

![image](https://user-images.githubusercontent.com/48075143/161447992-9cfc7699-5a42-415b-a8dc-f2b452ef5f66.png)

Pawn/Queen relationships occur when one player (the pawn) likes another player (the queen), but the queen does not care about the pawn. This is a one-sided relationship.

---

## Understanding Alliances: or "What do the arrows mean?" ##

![image](https://user-images.githubusercontent.com/48075143/161448070-e995dafc-d1cb-44c1-8eef-4241b949db49.png)

The arrows show you the overlap between alliances, like a venn diagram. Nemuno is friends with Cirno, and Merlin is friends with Cirno, but Merlin is not nessecarily friends with Nemuno. You can also think of this like the core of an alliance, and its affiliates.

---

## Understanding Endgame Winrate ##

![image](https://user-images.githubusercontent.com/48075143/161448238-7cfac826-d4a2-4749-a6f7-e91d73228355.png)

Jurors typically prefer to vote for their friends, so people with a lot of friends on jury will have an advantage if they make it to the final 2. You can click on players to see what their chances are against each opponent in an F2. If you haven't clicked on anyone, it displays the average chance they have of winning if they made it to the end.

---

## Running Locally (for developers) ## 
```
npm install
npm start
```
(you might get some issues with node-sass, because i have never in my life not had issues with node-sass. my only advice is just do stuff until it works)
