import React from "react";
import FileDrop from "react-file-drop";
import { PlayerProfile, GameState } from "../../model";
import { SetupPortrait } from "../playerPortrait/setupPortrait";
import { ImportLinks } from "./importLinks";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { PregameEpisode } from "../episode/pregameEpisode";
import { shuffle } from "lodash";
import { RandomButton } from "./randomXButton";
import { selectCastPlayer, selectPlayer } from "../playerPortrait/selectedPortrait";
import { mainContentStream$, newEpisode, selectedCastPlayer$, updateCast } from "../../subjects/subjects";
import { HasText, Input } from "../layout/text";
import { Centered } from "../layout/centered";
import { Subscription } from "rxjs";
import _ from "lodash";
import { HelpLink } from "../episode/allianceList";

interface CastingScreenProps {
    cast?: PlayerProfile[];
}

interface CastingScreenState {
    players: PlayerProfile[];
    selectedPlayers: Set<number>;
}

let id = 1;

export class CastingScreen extends React.Component<CastingScreenProps, CastingScreenState> {
    private sub: Subscription | null = null;

    constructor(props: CastingScreenProps) {
        super(props);
        if (props.cast) {
            selectCastPlayer(null);
            props.cast.forEach((player) => (player.castingScreenId = id++));
        }
        this.state = { players: props.cast || [], selectedPlayers: new Set<number>() };
    }

    public componentDidMount() {
        this.sub = selectedCastPlayer$.subscribe((selectedPlayers) => {
            this.setState({ selectedPlayers });
        });
    }

    public componentWillUnmount() {
        if (this.sub) this.sub.unsubscribe();
    }

    private deleteMethod(i: number, castingScreenId: number) {
        return () => {
            const newState = { ...this.state };
            newState.players.splice(i, 1);
            if (newState.selectedPlayers.has(castingScreenId)) {
                selectCastPlayer(castingScreenId);
            }
            this.setState(newState);
        };
    }

    private rename(i: number) {
        return () => {
            const newState = { ...this.state };
            const newName: string | null = prompt(`Enter a new name for ${newState.players[i].name}`);
            if (!newName) return;
            newState.players[i].name = newName;
            this.setState(newState);
        };
    }

    private getFiles() {
        const players = this.state.players;
        if (!players) {
            return;
        }
        const rows: JSX.Element[] = [];
        let i = 0;
        players.forEach((player) =>
            rows.push(
                <SetupPortrait
                    name={player.name}
                    imageUrl={player.imageURL}
                    onDelete={this.deleteMethod(i, player.castingScreenId || -1)}
                    onClick={() => {
                        selectCastPlayer(player.castingScreenId || -1);
                    }}
                    onRename={this.rename(i)}
                    selected={this.state.selectedPlayers.has(player.castingScreenId || -1)}
                    key={(++i).toString()}
                />
            )
        );
        return <div className="columns is-gapless is-mobile is-multiline is-centered">{rows}</div>;
    }

    private appendProfiles = (profiles: PlayerProfile[]) => {
        const newState = { ...this.state };
        profiles.forEach((profile) => newState.players.push(profile));
        this.setState(newState);
    };

    private submit = async () => {
        updateCast(this.state.players);
        mainContentStream$.next(<PregameScreen cast={this.state.players} />);
        selectPlayer(null);
        // vscode says the awaits are unnessecary here,
        await newEpisode(null);
        // but if you remove them then bad things happen
        await newEpisode(new PregameEpisode(new GameState(this.state.players)));
    };

    private random = (_amount: number) => {
        // get all the selected players first
        let result: PlayerProfile[] = [];
        let amount = _amount;

        const allPlayers = this.state.players;
        let unselectedPlayers: PlayerProfile[] = [];

        allPlayers.forEach((player) => {
            if (this.state.selectedPlayers.has(player.castingScreenId || -1)) {
                result.push(player);
                amount--;
            } else {
                unselectedPlayers.push(player);
            }
        });

        if (amount > 0) {
            unselectedPlayers = shuffle(unselectedPlayers);
            unselectedPlayers = unselectedPlayers.slice(0, amount);
        }
        let players = amount > 0 ? result.concat(unselectedPlayers) : result;
        players = shuffle(players);
        this.setState({ players });
    };

    public render() {
        return (
            <FileDrop onDrop={this.handleDrop}>
                <HasText className="level">
                    <ImportLinks onSubmit={this.appendProfiles} />
                    <div className="level-item">
                        <button
                            className="button is-danger"
                            onClick={() => {
                                this.setState({ players: [] });
                                selectCastPlayer(null);
                            }}
                        >
                            Delete all
                        </button>
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-danger"
                            disabled={this.state.selectedPlayers.size === 0}
                            onClick={() => {
                                const players = this.state.players.filter(
                                    (player) => !this.state.selectedPlayers.has(player.castingScreenId || -1)
                                );
                                this.setState({ players });
                                selectCastPlayer(null);
                            }}
                        >
                            Delete selected
                        </button>
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-warning"
                            onClick={() => selectCastPlayer(null)}
                            disabled={this.state.selectedPlayers.size === 0}
                        >
                            Unselect {this.state.selectedPlayers.size || "all"}
                        </button>
                    </div>
                    <div className="level-item">
                        <RandomButton random={this.random} />
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-success"
                            disabled={this.state.players.length < 3}
                            onClick={this.submit}
                        >
                            Submit
                        </button>
                    </div>
                </HasText>
                <Input type="file" multiple onChange={this.handleUpload} />
                {this.state.players.length === 0 && (
                    <Centered>
                        ~ Drop images here ~
                        <br />
                        <br />
                        <HelpLink
                            href="https://github.com/spaulmark/bb-bots/blob/master/README.md#choose-a-cast-of-characters"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Need help setting up a game?
                        </HelpLink>
                    </Centered>
                )}
                {this.getFiles()}
            </FileDrop>
        );
    }

    private handleUpload = (event: any) => {
        this.handleFiles(event.target.files);
    };

    private handleDrop = (files: FileList | null) => {
        if (!files) return;
        this.handleFiles(files);
    };

    private handleFiles(files: FileList) {
        const newState = { ...this.state };
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.match(/image\/*/)) {
                newState.players.push({
                    name: file.name.substr(0, file.name.lastIndexOf(".")) || file.name,
                    imageURL: URL.createObjectURL(file),
                    castingScreenId: id++,
                });
            }
        }
        this.setState(newState);
    }
}
