import React, { Component } from "react";
import "./App.css";
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
          <p>
            <MemoryWall
              houseguests={[
                new Houseguest({
                  name: "Shawn",
                  imageURL:
                    "https://akns-images.eonline.com/eol_images/Entire_Site/2018424/rs_634x792-180524105032-634.shawn-mendes.52418.jpg",
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
                  name: "Akane Owari",
                  imageURL:
                    "https://raw.githubusercontent.com/YKG123/imagesource/master/DanganRonpa/IMG/2/Akane_Owari.png",
                  evictedImageURL,
                  stats
                })
              ]}
            />
          </p>
        </header>
      </div>
    );
  }
}

export default App;
