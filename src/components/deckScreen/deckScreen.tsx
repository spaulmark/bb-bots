import React from "react";
import ReactPaginate from "react-paginate";
import { HasText } from "../layout/text";
import { shuffle, ceil } from "lodash";
import { PlayerProfile, GameState } from "../../model";
import { updateCast, mainContentStream$, newEpisode } from "../../subjects/subjects";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { selectPlayer } from "../playerPortrait/selectedPortrait";
import { PregameEpisode } from "../episode/pregameEpisode";
import { CastingScreen } from "../castingScreen/castingScreen";

interface DeckScreenProps {}

interface DeckScreenState {
    loading: boolean;
    decks: string[];
    i: number;
}

const decksPerPage = 26;
const baseUrl = "https://spaulmark.github.io/img/";

// TODO: make a cache for the randomly selected images for each deck

async function selectCast(folder: string) {
    const links = await (await fetch(`${baseUrl}${folder}/dir.json`)).json();
    const imageLinks = links["files"].map((file: string) => {
        return { name: file, url: `${baseUrl}${folder}/${file}` };
    });
    const playerProfiles = imageLinks.map((image: { name: string; url: string }) => {
        return new PlayerProfile({
            name: image.name.substr(0, image.name.lastIndexOf(".")) || image.name,
            imageURL: image.url,
        });
    });
    mainContentStream$.next(<CastingScreen cast={playerProfiles} />);
    // TODO: make a loading thing appear here
}

function CommentList(props: { data: string[]; i: number }): JSX.Element {
    let commentNodes: JSX.Element[] = [];
    const i = props.i;
    const data = props.data;
    const min = i * decksPerPage;
    for (let j = min; j < min + decksPerPage; j++) {
        const deck = data[j];
        commentNodes.push(
            <HasText key={deck} onClick={() => selectCast(deck)}>
                {deck}
            </HasText>
        );
    }

    return (
        <div id="project-comments" className="commentList" style={{ display: "flex" }}>
            <ul>{commentNodes}</ul>
        </div>
    );
}

export class DeckScreen extends React.Component<DeckScreenProps, DeckScreenState> {
    constructor(props: DeckScreenProps) {
        super(props);
        this.state = { loading: true, decks: [], i: 0 };
    }
    async componentDidMount() {
        const data = await (await fetch("https://spaulmark.github.io/img/dir.json")).json();
        this.setState({ decks: shuffle(data.decks), loading: false });
    }

    private handlePageClick = (page: { selected: number }) => {
        this.setState({ i: page.selected });
    };

    render() {
        if (this.state.loading) return <div />;
        return (
            <div>
                <CommentList data={this.state.decks} i={this.state.i} />
                <ReactPaginate
                    previousLabel={"previous"}
                    nextLabel={"next"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={ceil(this.state.decks.length / decksPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={this.handlePageClick}
                    containerClassName={"pagination"} /* as this work same as bootstrap class */
                    activeClassName={"active"} /* as this work same as bootstrap class */
                />
            </div>
        );
    }
}
