// Homebrew javascript implementation of this:
// https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution?enrichId=rgreq-6ff78e1a69dcaf49a733e2dd0e9f2db6-XXX&enrichSource=Y292ZXJQYWdlOzI1NzAxNzM1NjtBUzo1NTg0MDU5OTE1MzA0OTZAMTUxMDE0NTc3MTQ0Mw%3D%3D&el=1_x_3&_esc=publicationCoverPdf

import _ from "lodash";
import { fft, inverseFFT } from "./fft";

// Due to the high complexity of this function, it has been optimized for readability.
// And even then, it's still pretty spooky.

let flag = false;

export function pbincdf(p: number[]): number[] {
    if (!flag) {
        // console.log("p", p);
        // const expected = [
        //     0.017578125,
        //     0.0703125,
        //     0.1640625,
        //     0.24609375,
        //     0.24609375,
        //     0.1640625,
        //     0.0703125,
        //     0.017578125,
        //     0.001953125,
        // ];
        // console.log([
        //     0.017578125,
        //     0.0703125,
        //     0.1640625,
        //     0.24609375,
        //     0.24609375,
        //     0.1640625,
        //     0.0703125,
        //     0.017578125,
        //     0.001953125,
        // ]);
        // const expectedA = [
        //     0.001953125,
        //     0.017578125,
        //     0.0703125,
        //     0.1640625,
        //     0.24609375,
        //     0.24609375,
        //     0.1640625,
        //     0.0703125,
        //     0.017578125,
        //     0.001953125,
        // ];
        // const expectedB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // inverseFFT(expectedA, expectedB);
        // fft(expectedA, expectedB);
        // console.log("expected", expectedA, expectedB);
    }

    const n = p.length;
    const nPlusOne = n + 1;
    const ω = (2 * Math.PI) / nPlusOne;
    const a = [1];
    const b = [0];
    // STEP 1 OF THE ALGORITHM
    const sigmaLogModulusZ = (l: number): number => {
        let sum = 0;
        p.forEach((p_j) => {
            const e1 = (1 - p_j + p_j * Math.cos(ω * l)) ** 2;
            const e2 = (p_j * Math.sin(ω * l)) ** 2;
            sum += 0.5 * Math.log(e1 + e2); // TODO: the (( 0.5 seems to be missing here.)) ///// imma be real idk why this comment exists
        });
        return sum;
    };
    const sigmaPrincipalArgz = (l: number): number => {
        let sum = 0;
        p.forEach((p_j) => {
            const y = p_j * Math.sin(ω * l);
            const x = 1 - p_j + p_j * Math.cos(ω * l);
            sum += Math.atan2(y, x);
        });
        return sum;
    };
    for (let l = 1; l <= Math.ceil(n / 2); l++) {
        const d = Math.exp(sigmaLogModulusZ(l));
        const sigmaArgZ = sigmaPrincipalArgz(l);
        a[l] = d * Math.cos(sigmaArgZ);
        b[l] = d * Math.sin(sigmaArgZ);
        // a[l] = (d * Math.cos(sigmaArgZ)) / nPlusOne;
        // b[l] = (d * Math.sin(sigmaArgZ)) / nPlusOne;
    }
    // STEP 2 OF THE ALGORITHM
    for (let l = Math.ceil(n / 2) + 1; l <= n; l++) {
        a[l] = a[nPlusOne - l];
        b[l] = -b[nPlusOne - l];
    }
    // STEP 3 OF THE ALGORITHM
    const c = _.clone(a);
    const d = _.clone(b);
    // !flag && console.log("actual", c, d);
    fft(a, b);
    // !flag && console.log("actual", a, b);
    const ξ = a;
    // !flag && console.log(ξ);
    // STEP 4 OF THE ALGORITHM
    const result: number[] = [];

    // ----------------- TEST ZONE -----------------------

    ξ.forEach((a, i) => (ξ[i] = a / nPlusOne));

    const eps = _.clone(ξ);
    !flag && console.log(eps);
    // ----------------- TEST ZONE -----------------------

    result[0] = ξ[0];
    ξ.forEach((_, m) => {
        if (m === 0) return;
        result[m] = ξ[m - 1] + ξ[m];
    });

    if (!flag) {
        const expected = [
            0.01953125,
            0.08984375,
            0.2539062,
            0.5,
            0.7460937,
            0.9101562,
            0.9804687,
            0.9980469,
            1,
        ];
        // console.log("expected", expected);
        console.log("final result", result);
    }

    !flag && (flag = true);
    return result;
}
