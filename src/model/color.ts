function componentToHex(c: any) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export class Rgb {
    public r: number;
    public g: number;
    public b: number;
    public toHex() {
        return "#" + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
    }
    public toRgba(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, 1)`;
    }
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

export function interpolateColor(min: Rgb, max: Rgb, percent: number): string {
    return new Rgb(
        min.r + percent * (max.r - min.r),
        min.g + percent * (max.g - min.g),
        min.b + percent * (max.b - min.b)
    ).toHex();
}
