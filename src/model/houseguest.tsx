import { PlayerProfile } from "./playerProfile";

export class Houseguest {
  readonly profileData: PlayerProfile;
  public isEvicted: boolean = false;
  public isJury: boolean = false;
  // relationships?
  // descision making functions...

  constructor(init: PlayerProfile) {
    this.profileData = init;
  }
}
