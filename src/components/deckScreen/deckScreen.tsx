import React from "react";
import ReactPaginate from "react-paginate";
import { HasText } from "../layout/text";
import { shuffle, ceil, debounce } from "lodash";
import { mainContentStream$, selectDeckSubject, selectedDecks$ } from "../../subjects/subjects";
import { CastingScreen } from "../castingScreen/castingScreen";
import _ from "lodash";
import styled from "styled-components";
import { Subscription } from "rxjs";
import { selectedColor } from "../playerPortrait/houseguestPortraitController";

interface DeckScreenProps {}

interface DeckScreenState {
    loading: boolean;
    decks: string[];
    i: number;
    debouncedSearchText: string;
    searchText: string;
    selectedDecks: Set<string>;
}

const decksPerPage = 26;
const baseUrl = "https://spaulmark.github.io/img/";

const imageCache: { [id: string]: string } = {};

const DeckStyle = styled(HasText)`
    display: flex;
    cursor: pointer;
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

async function randomImageFromFolder(folder: string) {
    if (imageCache[folder]) return imageCache[folder];
    const links = await (await fetch(`${baseUrl}${folder}/dir.json`)).json();
    const image = _.sample(links["files"]);
    imageCache[folder] = `${baseUrl}${folder}/${image}`;
    return `${baseUrl}${folder}/${image}`;
}

// TODO: make this function take in an array of folders instead of one folder
async function submitCasts(folder: string) {
    const links = await (await fetch(`${baseUrl}${folder}/dir.json`)).json();
    const imageLinks = links["files"].map((file: string) => {
        return { name: file, url: `${baseUrl}${folder}/${file}` };
    });
    const playerProfiles = imageLinks.map((image: { name: string; url: string }) => {
        return {
            name: image.name.substr(0, image.name.lastIndexOf(".")) || image.name,
            imageURL: image.url,
        };
    });
    mainContentStream$.next(<CastingScreen cast={playerProfiles} />);
}

function Deck(props: { deck: string; selected: boolean }): JSX.Element {
    const [img, setImage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const deck = props.deck;

    if (loading)
        randomImageFromFolder(deck).then((img) => {
            setLoading(false);
            setImage(img);
        });
    const style = props.selected ? { backgroundColor: selectedColor.toHex(), color: "black" } : {};
    return (
        <DeckStyle className="column is-6" onClick={() => selectDeckSubject(props.deck)} style={style}>
            <img src={img} style={{ width: 50, height: 50 }} />
            <DeckText>{deck}</DeckText>
        </DeckStyle>
    );
}

function DeckList(props: { data: string[]; i: number; selected: Set<string> }): JSX.Element {
    let decks: JSX.Element[] = [];
    const i = props.i;
    const data = props.data;
    const min = i * decksPerPage;
    for (let j = min; j < min + decksPerPage; j++) {
        const deck = data[j];
        if (!deck) continue;
        decks.push(<Deck selected={props.selected.has(deck)} key={`${deck}__${i}__${j}`} deck={deck} />);
    }
    return (
        <div key={"__ul__"} className={"columns is-multiline"}>
            {decks}
        </div>
    );
}

export class DeckScreen extends React.Component<DeckScreenProps, DeckScreenState> {
    private subs: Subscription[] = [];

    constructor(props: DeckScreenProps) {
        super(props);
        this.state = {
            loading: true,
            decks: [],
            selectedDecks: new Set<string>(),
            i: 0,
            debouncedSearchText: "",
            searchText: "",
        };
    }
    async componentDidMount() {
        selectDeckSubject(null);
        this.subs.push(selectedDecks$.subscribe((selectedDecks) => this.setState({ selectedDecks })));
        const data = await (await fetch("https://spaulmark.github.io/img/dir.json")).json();
        this.setState({ decks: shuffle(data.decks), selectedDecks: new Set<string>(), loading: false });
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private handlePageClick = (page: { selected: number }) => {
        this.setState({ i: page.selected });
    };

    private debounceSearch = debounce((nextValue: string) => {
        this.setState({ debouncedSearchText: nextValue, i: 0 });
    }, 250);

    private handleSearch = (event: { target: { value: string } }) => {
        this.setState({ searchText: event.target.value });
        this.debounceSearch(event.target.value);
    };

    render() {
        if (this.state.loading) return <div />;
        const decks = this.state.decks.filter((deck) =>
            deck.toLowerCase().match(this.state.debouncedSearchText.toLowerCase())
        );
        return (
            <div>
                <div className="level">
                    <div className="level-item">
                        <input
                            style={{ marginBottom: "1.5rem", minWidth: "50%" }}
                            className="input"
                            type="text"
                            placeholder="Search..."
                            onChange={this.handleSearch}
                            value={this.state.searchText}
                        ></input>
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-warning"
                            onClick={() => selectDeckSubject(null)}
                            disabled={this.state.selectedDecks.size === 0}
                        >
                            Unselect All
                        </button>
                    </div>
                    <div className="level-item">
                        <HasText>{`${this.state.selectedDecks.size} decks selected`}</HasText>
                    </div>
                    <div className="level-item">
                        <button className="button is-success" disabled={this.state.selectedDecks.size === 0}>
                            Submit
                        </button>
                    </div>
                </div>
                <DeckList
                    key={"comments"}
                    selected={this.state.selectedDecks}
                    data={decks}
                    i={this.state.i}
                />
                <Centered>
                    <ReactPaginate
                        key={"__list__"}
                        previousLabel={"previous"}
                        nextLabel={"next"}
                        breakLabel={"..."}
                        breakClassName={"break-me"}
                        pageCount={ceil(decks.length / decksPerPage)}
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
