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
export function textColor(bg: string): "#000000" | "#ffffff" {
    var color = bg.charAt(0) === "#" ? bg.substring(1, 7) : bg;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.179 ? "#000000" : "#ffffff";
}
