import prand from "pure-rand";

export class BbRandomGenerator {
  private rng: prand.RandomGenerator;

  public randomInt(a: number, b: number): number {
    let result: number;
    [result, this.rng] = prand.uniformIntDistribution(a, b, this.rng);
    return result;
  }

  public constructor(seed: number) {
    this.rng = prand.mersenne(seed);
  }
}
