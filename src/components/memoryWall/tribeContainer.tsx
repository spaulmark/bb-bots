import React from "react";
import { DividerBox } from "../layout/box";
import { Centered } from "../layout/centered";
import { Portraits } from "../playerPortrait/portraits";
import { ProfileHouseguest } from "./memoryWall";

interface TribeContainerProps {
    hgs: ProfileHouseguest[];
    tribe: { name: string; color: string };
}

export class TribeContainer extends React.Component<TribeContainerProps, {}> {
    public constructor(props: TribeContainerProps) {
        super(props);
    }

    public render() {
        // FIXME: note that tribe text does not appear in the specified color yet.
        const tribeName = this.props.tribe.name;
        return (
            <DividerBox
                className={`column ${this.props.hgs.length === 1 ? "is-narrow" : ""}`}
                key={tribeName}
                style={{ textAlign: "center", padding: 0 }}
            >
                {tribeName !== "undefined" && (
                    <Centered>
                        <b>{tribeName}</b>
                    </Centered>
                )}
                <div
                    style={{
                        margin: "auto",
                        maxWidth: this.props.hgs.length > 7 ? 800 : -1,
                    }}
                >
                    <Portraits houseguests={this.props.hgs} centered={true}></Portraits>
                </div>
            </DividerBox>
        );
    }
}
