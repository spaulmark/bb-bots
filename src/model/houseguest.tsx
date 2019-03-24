import { PlayerProfile } from "./playerProfile";

export class Houseguest {
  readonly profileData: PlayerProfile;
  public isEvicted: boolean = false;
  public isJury: boolean = false;
  // Popularity ranges from -1 to 1 TODO: fixed at zero
  public popularity: number = Math.random() * 2 - 1;
  // relationships?
  // descision making functions...

  constructor(init: PlayerProfile) {
    this.profileData = init;
    this.isEvicted = Math.random() > 0.4;
  }
}
