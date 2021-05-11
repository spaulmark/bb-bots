import React from "react";
import { MainPage } from "./components/mainPage/mainPage";
import { MainPageController } from "./components/mainPage/mainPageController";
import { ThemeProvider } from "styled-components";
import { lightTheme, ColorTheme, darkTheme } from "./theme/theme";
import { GlobalStyles } from "./theme/globalTheme";
import { theme$ } from "./subjects/subjects";
import { Subscription } from "rxjs";

class App extends React.Component<{}, { theme: ColorTheme }> {
    private sub: Subscription | null = null;
    public constructor(props: any) {
        super(props);
        this.state = {
            theme: darkTheme,
        };
    }

    public componentDidMount() {
        this.sub = theme$.subscribe((theme) => {
            this.setState({ theme });
        });
    }

    public componentWillUnmount() {
        if (this.sub) this.sub.unsubscribe();
    }

    render() {
        return (
            <ThemeProvider theme={this.state.theme}>
                <>
                    <GlobalStyles />
                    <MainPage controller={new MainPageController()} />
                </>
            </ThemeProvider>
        );
    }
}

export default App;
