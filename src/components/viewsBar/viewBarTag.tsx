import React from "react";
import { PortraitDisplayMode, powerMode } from "../../model/portraitDisplayMode";
import { displayMode$, getSelectedPlayer, selectedPlayer$ } from "../../subjects/subjects";
import { Subscription } from "rxjs";

function setDisplayMode(p: PortraitDisplayMode) {
    if (p === powerMode) {
        const player = getSelectedPlayer();
        if (player && (!player.superiors || Object.keys(player.superiors).length === 0)) {
            selectedPlayer$.next(null);
        }
    }
    displayMode$.next(p);
}

interface ViewBarTagProps {
    mode: PortraitDisplayMode;
    text: string;
    disabled?: boolean;
}

export class ViewBarTag extends React.Component<ViewBarTagProps, { selected: boolean }> {
    private sub: Subscription | null = null;

    public constructor(props: ViewBarTagProps) {
        super(props);
        this.state = { selected: props.mode === displayMode$.value };
    }

    public componentDidMount() {
        this.sub = displayMode$.subscribe({
            next: (mode) => {
                if (mode !== this.props.mode) {
                    this.setState({ selected: false });
                } else {
                    this.setState({ selected: true });
                }
            },
        });
    }

    public componentWillUnmount() {
        if (this.sub) this.sub.unsubscribe();
    }

    public render() {
        const name = "level-item tag is-medium is-light";
        const style = getStyle(this.props);
        return (
            <span
                className={name}
                style={style}
                onClick={() => {
                    !this.props.disabled && setDisplayMode(this.props.mode);
                    !this.props.disabled && this.setState({ selected: true });
                }}
            >
                {styleText(this.props.text, this.state.selected)}
            </span>
        );
    }
}

function styleText(text: string, selected: boolean): JSX.Element {
    return selected ? <b>{text}</b> : <i>{text}</i>;
}

function getStyle(props: ViewBarTagProps) {
    return props.disabled
        ? {}
        : {
              background: `linear-gradient(90deg, ${props.mode.minColor.toRgba()} 0%, ${props.mode.maxColor.toRgba()} 100%)`,
              cursor: "pointer",
          };
}
