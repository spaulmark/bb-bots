import "./mainPage.scss";
import { MemoryWall } from "../memoryWall";
import { Houseguest } from "../../model";
import React from "react";
import { Sidebar } from "../sidebar/sidebar";
import { Topbar } from "../topbar/topBar";
const stats = {
  str: 0,
  int: 1,
  dex: 2,
  will: 3,
  luck: 5,
  memory: 500
};

let id = 0;

const othercrap = () => {
  return {
    nominations: Math.round(Math.random()),
    hohWins: Math.round(Math.random()),
    povWins: Math.round(Math.random()),
    isEvicted: Math.random() < Math.random() / 2,
    isJury: false,
    popularity: Math.random() * 2 - 1,
    relationships: {},
    id: ++id
  };
};

const evictedImageURL = "BW";

export class MainPage extends React.Component {
  // sidebar --- tabs on top of the main content area -- main content area -- top bar
  // main page has a cast? maybe. we need some sort of pregame state - and fast.

  public render() {
    // top bar on the top
    // main content area container
    return (
      <div className="main-page">
        <Topbar />
        <div className="columns">
          <div className="column is-narrow">
            <Sidebar />
          </div>
          <div className="column">
            {/* might wanna make this a box later.*/}
            <MemoryWall
              houseguests={[
                new Houseguest({
                  name: "Shawn",
                  imageURL: "https://i.ibb.co/1GjNdN7/linkedin.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Uncle Grug",
                  imageURL: "https://i.ibb.co/y6yYxcX/uncle-grug.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Brian",
                  imageURL: "https://i.ibb.co/k18Zb6v/brian.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Akane Owari",
                  imageURL:
                    "https://raw.githubusercontent.com/YKG123/imagesource/master/DanganRonpa/IMG/2/Akane_Owari.png",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Ronnie",
                  imageURL: "https://i.ibb.co/1GGgqWk/ronny.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Richard Smiles",
                  imageURL: "https://i.ibb.co/RzsPYtx/smiley-dick.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Judge Brown",
                  imageURL: "https://i.ibb.co/SryCtL6/judge-brown.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Bryce",
                  imageURL: "https://i.ibb.co/YQrYLzp/frie-nd.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Mole Amaz",
                  imageURL: "https://i.ibb.co/vjRkKL4/the-mole.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "The Colonel",
                  imageURL: "https://i.ibb.co/3fCJB6r/grug2.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Oz",
                  imageURL: "https://i.ibb.co/2h7M382/australian.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Elinda",
                  imageURL: "https://i.ibb.co/PCs87bN/granny.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Marth",
                  imageURL: "https://i.ibb.co/j5P82xQ/marth.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Lindsey",
                  imageURL: "https://i.ibb.co/NTzVgX3/cool-tour-guide.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Sponge",
                  imageURL: "https://i.ibb.co/zrpwcbj/nohair.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Scamantha",
                  imageURL: "https://i.ibb.co/zXZ0t99/chinese.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Miss Match",
                  imageURL: "https://i.ibb.co/K9v84pV/hehadband.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                }),
                new Houseguest({
                  name: "Madame Carnivale",
                  imageURL: "https://i.ibb.co/FskLmrr/carnivale.jpg",
                  evictedImageURL,
                  stats,
                  ...othercrap()
                })
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}
