import React, { Component } from "react";
import { MemoryWall } from "./components/memoryWall/memoryWall";
import { Houseguest } from "./model/houseguest";

const stats = {
  str: 0,
  int: 1,
  dex: 2,
  will: 3,
  luck: 5,
  memory: 500
};

const evictedImageURL = "BW";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <MemoryWall
            houseguests={[
              new Houseguest({
                name: "Shawn",
                imageURL: "https://i.ibb.co/1GjNdN7/linkedin.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Uncle Grug",
                imageURL: "https://i.ibb.co/y6yYxcX/uncle-grug.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Brian",
                imageURL: "https://i.ibb.co/k18Zb6v/brian.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Akane Owari",
                imageURL:
                  "https://raw.githubusercontent.com/YKG123/imagesource/master/DanganRonpa/IMG/2/Akane_Owari.png",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Ronnie",
                imageURL: "https://i.ibb.co/1GGgqWk/ronny.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Triangle Zodiac",
                imageURL: "https://i.ibb.co/yf55ncJ/triangle.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Judge Brown",
                imageURL: "https://i.ibb.co/SryCtL6/judge-brown.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Bryce",
                imageURL: "https://i.ibb.co/YQrYLzp/frie-nd.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Samsora",
                imageURL: "https://i.ibb.co/f9Ngmgj/samsso.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "The Rock",
                imageURL: "https://i.ibb.co/mR56Ymb/rock.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Oz",
                imageURL: "https://i.ibb.co/2h7M382/australian.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Elinda",
                imageURL: "https://i.ibb.co/PCs87bN/granny.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Marth",
                imageURL: "https://i.ibb.co/j5P82xQ/marth.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "mmmmmmmmmmmmmmmmmmmmmmmm",
                imageURL: "https://i.ibb.co/wNmVRJ5/honistia.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Sponge",
                imageURL: "https://i.ibb.co/zrpwcbj/nohair.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Scamantha",
                imageURL: "https://i.ibb.co/zXZ0t99/chinese.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Miss Match",
                imageURL: "https://i.ibb.co/K9v84pV/hehadband.jpg",
                evictedImageURL,
                stats
              }),
              new Houseguest({
                name: "Wakasagihime Shinmyoumaru",
                imageURL: "https://i.ibb.co/CP2q4qH/bbbq.jpg",
                evictedImageURL,
                stats
              })
            ]}
          />
        </header>
      </div>
    );
  }
}

export default App;
