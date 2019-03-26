import { isValidStats, Stats } from "./stats";

export class PlayerProfile {
  readonly name: string = "";
  readonly imageURL: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAM3SURBVGhD7ZlZyE5bGIB/U4jMJ9MNqRPJjRtDTpLpAndHSYlMZUiUZCYlF4biQiFJGaIonZCEpCNluBHlxpDxSIaLQ5mfZ9W6wf993977Z231PfVcvKu91/fuYa39rvU11Knze9ECh+F83Iy7cAcuQ9tLTwdcj8/wSwWvYB8sJYPxPproZ7yBu3EdzsGFuB0fosf8h9twAJaG/vgaTfAMDsTGaI2nMD6dT+jFJqcZXkWTOojNsRqOIZ/EanyHnrsYkzIGTcRx0cmGjIxFz/8fu9mQCt97E9kQonycRftwLCXjJprE0BDlw2naPpymk/EcTaJLiPIxCu3jQogS8RFNwgGclxFoH5dClIi3aBKtQpSPkWgfF0OUiHtoEr1DlI+paB9HQpSIy2gSQ0KUD2c8+ygy8xVmJ5rEvBDlw0FuH+NDlIiZaBL7QpQdSxa/7k4aFp3JWIVeyK0QZScOdC+mhw2peIEmYvWbB2u1PWgfLgGSYY1kEkVei+VoH1tClAjnfpOYFKJ8nEb7mBKiRMQ66SmusSEDnfEcuhB7iXmq5ybDL3qcgrMO+DjQvQkTbCgDFo+u9rqGqDZcWHkhm0JUEg6hSS0JUXWcre6g54y2oSyYjEm5qeC7X43p6PF3sZbl8S/lJJqcOyhtbGgEx8Yb9FgLxtLRHeNmQkcbGsG6zGP+QV+xUpLlQvaGqKSYoLYN0Y+ZjR7j9lEpcblrgk7DlfAL7nFJF1KVmIEm6KqxEsPR4/wQJq14v8UZaiO+RxOchdU4jx77AJN/1XviWnyCJmXNVGu99QfGrVb9F33limxiZMZX4zDGJ6DX0e9DFlwdujCLG+DqTfHm/NRXbhy69xR/9AMeQzfYitAeF+BtjH07jbsdW2R35jv6ouV2/JFHaMHXC5uav/AAepPiBa3EllgIO3atYKfOMouwUvnRVPTD/ei487ctf9phLgZhfH+dZRygv5qJ+ArN4QRm3pq1IrX4swMfdZG93aL8iXGzfK4NWfgbPdFZxMGYmmloPo8x0009jp64NUTpcaqOpX+mhVj899Uv9uSSeA3NaQXWhLNSnC3KaM3lv9syR0vsUqxTp07NNDR8BciTJGl2qRtJAAAAAElFTkSuQmCC";
  readonly evictedImageURL: string = "BW";
  readonly stats!: Stats;
  constructor(init: PlayerProfile) {
    if (!init || !isValidStats(init.stats)) {
      throw new Error("invalid stats"); // TODO: handle this exception when creating players.
    }
    Object.assign(this, init);
  }
}
