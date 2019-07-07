import { extremeValues, RelationshipMap } from "../../utils";

const maxPopularity = { r: 137, g: 252, b: 137 };
const minPopularity = { r: 252, g: 137, b: 137 };
const selectedColor = { r: 51, g: 255, b: 249 };
export interface PortraitProps {
    evictedImageURL: string;
    imageURL: string;
    name: string;
    id?: number;
    relationships?: RelationshipMap;
    isEvicted?: boolean;
    isJury?: boolean;
    popularity?: number;
    deltaPopularity?: number;
    generateSubtitle?: (props: PortraitProps, state: PortraitState) => string[];
    tags?: string[];
}

export interface PortraitState {
    popularity?: number;
}

function componentToHex(c: any) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: any, g: any, b: any) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
export function backgroundColor(props: PortraitProps, popularity: number | undefined) {
    if (popularity && (popularity > 1 || popularity < -1)) {
        return rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
    }
    const extremePopularity = extremeValues(popularity);
    const percent = (extremePopularity + 1) / 2;
    return props.isEvicted
        ? undefined
        : rgbToHex(
              minPopularity.r + percent * (maxPopularity.r - minPopularity.r),
              minPopularity.g + percent * (maxPopularity.g - minPopularity.g),
              minPopularity.b + percent * (maxPopularity.b - minPopularity.b)
          );
}
