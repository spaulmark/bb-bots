import { Houseguest } from "./houseguest";

export class GameState {
  // Current state of the game after a phase.

  readonly houseguests!: Houseguest[];

  // History of the game so far.

  readonly phase: number = 1;
  readonly previousHOH?: Houseguest;
  /**
   * gamestate is an immutable class
   * 
    relationship graph? i think that goes in player.
   
    double eviction, season seed/hash, twists, and other stuff go in the episode factory that generates the next episode.
    
    all the statistics of who voted for who, who won HoH each week, etc.

    The main idea being you can just pass a GameState object into a getNextEpisode function,
    and it gives you the next episode, or an "END OF SEASON" episode along with a winner.
    */
}
