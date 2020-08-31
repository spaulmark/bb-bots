import React from "react";
import ReactPaginate from "react-paginate";
import { HasText } from "../layout/text";
import { shuffle, ceil } from "lodash";
import { PlayerProfile } from "../../model";
import { mainContentStream$ } from "../../subjects/subjects";
import { CastingScreen } from "../castingScreen/castingScreen";
import _ from "lodash";

interface DeckScreenProps {}

interface DeckScreenState {
    loading: boolean;
    decks: string[];
    i: number;
}

const decksPerPage = 26;
const baseUrl = "https://spaulmark.github.io/img/";

const imageCache: { [id: string]: string } = {};

// TODO: add a search bar, add a sort alphebetically function.

// TODO: make it so when it loads the decks,
// as they appear on the page it loads a random image from them, and caches that image,
// and also loads their size, and caches the size.
// Also mousing over that image displays a tooltip.

async function randomImageFromFolder(folder: string) {
    if (imageCache[folder]) return imageCache[folder];
    const links = await (await fetch(`${baseUrl}${folder}/dir.json`)).json();
    const image = _.sample(links["files"]);
    imageCache[folder] = image;
    return image;
}

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
    // TODO: make a loading circle appear here while it's getting the images
}

function CommentList(props: { data: string[]; i: number }): JSX.Element {
    let commentNodes: JSX.Element[] = [];
    const i = props.i;
    const data = props.data;
    const min = i * decksPerPage;
    for (let j = min; j < min + decksPerPage; j++) {
        const deck = data[j];
        commentNodes.push(
            <HasText key={`${deck}__${i}__${j}`} onClick={() => selectCast(deck)}>
                {deck}
            </HasText>
        );
    }

    return (
        <div
            id="project-comments"
            className="commentList"
            key={"__commentList__"}
            style={{ display: "flex" }}
        >
            <ul key={"__ul__"}>{commentNodes}</ul>
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
                <CommentList key={"comments"} data={this.state.decks} i={this.state.i} />
                <ReactPaginate
                    key={"__list__"}
                    previousLabel={"previous"}
                    nextLabel={"next"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={ceil(this.state.decks.length / decksPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={this.handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                />
            </div>
        );
    }
}
