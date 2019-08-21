import React from "react";

export class ViewsBar extends React.Component {
    render() {
        return (
            <div className="level box is-mobile" key="viewsbar">
                <span className="level-item tag">Popularity View</span>
                <span className="level-item tag">Power Rankings</span>
                <span className="level-item tag">Cliques</span>
            </div>
        );
    }
}
