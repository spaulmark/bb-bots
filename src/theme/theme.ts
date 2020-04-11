export interface ColorTheme {
    name: string;
    bg: string;
    text: string;
    toggleBorder: string;
    gradient: string;
    bodyArea: string;
    link: string;
    mark: string;
    overlay: string;
    evictedCell: string;
    grayCell: string;
    winnerCell: string;
    lightGrayCell: string;
    runnerUpCell: string;
    nomineeCell: string;
    hohCell: string;
}

export const lightTheme: ColorTheme = {
    name: "light",
    bg: "#fff",
    text: "#363537",
    toggleBorder: "#FFF",
    gradient: "linear-gradient(#39598A, #79D7ED)",
    bodyArea: "#fff",
    link: "blue",
    mark: "yellow",
    overlay: "fff",
    evictedCell: "#fa8072",
    grayCell: "#eaecf0",
    lightGrayCell: "#f8f9fa",
    winnerCell: "#73fb76",
    runnerUpCell: "#d1e8ef",
    nomineeCell: "#959ffd",
    hohCell: "#CCFFCC",
};

export const darkTheme: ColorTheme = {
    name: "dark",
    bg: "#121212",
    text: "#FAFAFA",
    bodyArea: "#363537",
    toggleBorder: "#6B8096",
    gradient: "linear-gradient(#091236, #1E215D)",
    link: "lightblue",
    mark: "#7e006d",
    overlay: "#444346",
    evictedCell: "#9d4c43",
    grayCell: "#5e5e5e",
    lightGrayCell: "#404040",
    runnerUpCell: "#9fbec882",
    nomineeCell: "#6c75d0",
    winnerCell: "#00ac04",
    hohCell: "#3f783f",
};
