import React from "react";
import ReactPaginate from "react-paginate";
import { HasText } from "../layout/text";
import { shuffle, ceil } from "lodash";
import { PlayerProfile } from "../../model";
import { mainContentStream$ } from "../../subjects/subjects";
import { CastingScreen } from "../castingScreen/castingScreen";
import _ from "lodash";
import styled from "styled-components";

interface DeckScreenProps {}

interface DeckScreenState {
    loading: boolean;
    decks: string[];
    i: number;
}

const decksPerPage = 26;
const baseUrl = "https://spaulmark.github.io/img/";

const imageCache: { [id: string]: string } = {};

const DeckStyle = styled(HasText)`
    display: flex;
    align-items: center;
    :hover {
        color: red;
        background-color: #ffe1ea;
    }
`;

const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const DeckText = styled.p`
    margin-left: 1rem;
`;

// TODO: add a search bar, add a sort alphebetically function.

async function randomImageFromFolder(folder: string) {
    if (imageCache[folder]) return imageCache[folder];
    const links = await (await fetch(`${baseUrl}${folder}/dir.json`)).json();
    const image = _.sample(links["files"]);
    imageCache[folder] = `${baseUrl}${folder}/${image}`;
    return `${baseUrl}${folder}/${image}`;
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
}

function Deck(props: { deck: string }): JSX.Element {
    const [img, setImage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const deck = props.deck;

    if (loading)
        randomImageFromFolder(deck).then((img) => {
            setLoading(false);
            setImage(img);
        });
    return (
        <DeckStyle className="column is-6" onClick={() => selectCast(deck)}>
            <img src={img} style={{ width: 50, height: 50 }} />
            <DeckText>{deck}</DeckText>
        </DeckStyle>
    );
}

function DeckList(props: { data: string[]; i: number }): JSX.Element {
    let commentNodes: JSX.Element[] = [];
    const i = props.i;
    const data = props.data;
    const min = i * decksPerPage;
    for (let j = min; j < min + decksPerPage; j++) {
        const deck = data[j];
        if (!deck) continue;
        commentNodes.push(<Deck key={`${deck}__${i}__${j}`} deck={deck} />);
    }
    return (
        <div id="project-comments" key={"__commentList__"} style={{ display: "flex" }}>
            <div key={"__ul__"} className={"columns is-multiline"}>
                {commentNodes}
            </div>
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
                <DeckList key={"comments"} data={this.state.decks} i={this.state.i} />
                <Centered>
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
                </Centered>
            </div>
        );
    }
}
