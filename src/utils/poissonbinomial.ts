// Homebrew typescript implementation of this:
// https://www.researchgate.net/publication/257017356_On_computing_the_distribution_function_for_the_Poisson_binomial_distribution?enrichId=rgreq-6ff78e1a69dcaf49a733e2dd0e9f2db6-XXX&enrichSource=Y292ZXJQYWdlOzI1NzAxNzM1NjtBUzo1NTg0MDU5OTE1MzA0OTZAMTUxMDE0NTc3MTQ0Mw%3D%3D&el=1_x_3&_esc=publicationCoverPdf

import { fft } from "./fft";

// Due to the high complexity of this function, it has been optimized for readability.
// And even then, it's still pretty spooky.

export function pbincdf(pp: number[]): number[] {
    const p: number[] = [];
    const zeros: number[] = [];
    const ones: number[] = [];
    pp.forEach((num) => {
        num === 0 && zeros.push(0);
        num === 1 && ones.push(1);
        num !== 0 && num !== 1 && p.push(num);
    });
    const cdf = _pbincdf(p);
    cdf.forEach((number, i) => (cdf[i] = 1 - number));
    const result = ones.concat(cdf, zeros);
    return result;
}

function _pbincdf(p: number[]): number[] {
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
            sum += 0.5 * Math.log(e1 + e2);
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
    }
    // STEP 2 OF THE ALGORITHM
    for (let l = Math.ceil(n / 2) + 1; l <= n; l++) {
        a[l] = a[nPlusOne - l];
        b[l] = -b[nPlusOne - l];
    }
    // STEP 3 OF THE ALGORITHM
    fft(a, b);
    const ξ = a;
    // STEP 4 OF THE ALGORITHM
    const result: number[] = [];
    ξ.forEach((a, i) => (ξ[i] = a / nPlusOne));
    result[0] = ξ[0];
    ξ.forEach((_, m) => {
        if (m === 0) return;
        result[m] = result[m - 1] + ξ[m];
    });
    return result;
}
