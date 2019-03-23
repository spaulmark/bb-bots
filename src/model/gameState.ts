import { Houseguest } from "./houseguest";

export class GameState {
  houseguests!: Houseguest[];
  /**
    relationship graph
    popularity calculations. jury equity calculations. 
    
    double eviction, season seed/hash, twists, and other stuff go in the season object that generates the next episode.
    
    all the statistics of who voted for who, who won HoH each week, etc.

    The main idea being you can just pass a GameState object into a getNextEpisode function,
    and it gives you the next episode, or an "END OF SEASON" flag along with a winner.
    */
}
