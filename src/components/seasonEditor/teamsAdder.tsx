import React from "react";
import { Tribe } from "../../model/tribe";
import { NumericInput } from "../castingScreen/numericInput";
import { CenteredBold } from "../layout/centered";
import { Label } from "./seasonEditorPage";

function Team(props: { tribe: ChangableTeam; disabled: boolean }) {
    const tribe = props.tribe;
    return (
        <div className="field has-addons" style={{ textAlign: "center" }} key={tribe.tribeId}>
            <p className="field-label is-normal control">
                <Label className="label">Name:</Label>
            </p>
            <p className="control">
                <input
                    className="input"
                    value={tribe.name}
                    onChange={(event) => props.tribe.onChangeName(event.target.value)}
                />
            </p>
            <p className="field-label is-normal control">
                <Label className="label">Color</Label>
            </p>
            <p className="control">
                <input
                    type="color"
                    value={tribe.color}
                    onChange={(event) => props.tribe.onChangeColor(event.target.value)}
                />
            </p>
            <p className="control">
                <button className="button is-danger" disabled={props.disabled}>
                    X
                </button>
            </p>
        </div>
    );
}

// TODO: adding a team adds two types of episodes,

// a visible an an invisible one. first is the team start, which is visible
// then the team ending, which is an invisible pseudo episode.

// the team ending doesn't appear in the list of episodes

// maybe in EpisodeType: add a function when does team end or something

// TODO: it would be really nice if there was an id or something corresponding to each teams phase
// so when we hit submit it generated all the information we needed or something -_- UGH this is so hard

export interface ChangableTeam extends Tribe {
    onChangeName: (name: string) => void;
    onChangeColor: (color: string) => void;
}

export interface TeamAdderProps {
    id: number;
    Teams: { [id: number]: ChangableTeam };
    endsWhen: string;
    onChangeNumber: (n: string) => void;
    addTeam: () => void;
}

export class TeamsAdder extends React.Component<TeamAdderProps, {}> {
    public render() {
        const teams = Object.values(this.props.Teams);
        return (
            <div
                className="column is-12-desktop is-12-widescreen is-12-fullhd is-12-tablet"
                style={{
                    border: "1px solid #808080",
                    borderRadius: "4px",
                    backgroundColor: "#444346",
                    margin: "10px",
                }}
                key={this.props.id}
            >
                <CenteredBold>Team Phase {this.props.id}</CenteredBold>
                {teams.map((tribe, i) => (
                    <Team tribe={tribe} key={i} disabled={teams.length <= 2} />
                ))}
                <button className="button is-primary" onClick={this.props.addTeam}>
                    Add Team
                </button>
                <div className="field has-addons" style={{ textAlign: "center" }}>
                    <p className="field-label is-normal control">
                        <Label className="label">Ends when</Label>
                    </p>
                    <p className="control">
                        <NumericInput
                            className="input"
                            value={this.props.endsWhen}
                            onChange={this.props.onChangeNumber}
                        />
                    </p>
                    <p className="field-label is-normal control">
                        <Label className="label">houseguests remain</Label>
                    </p>
                </div>
            </div>
        );
    }
}
