import React, { useState } from "react";
import { theme$ } from "../../subjects/subjects";
import { darkTheme, lightTheme } from "../../theme/theme";

export function ThemeSwitcher() {
    const [theme, setTheme] = useState(
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
            theme$.next(darkTheme);
        } else {
            setTheme("light");
            theme$.next(lightTheme);
        }
    };

    const className = `button ${theme === "dark" ? `is-dark` : "is-light"}`;
    return (
        <div className={className} onClick={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
        </div>
    );
}
