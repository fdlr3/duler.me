import React, { Component } from 'react';
import '../loader.css';

export class Loader extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="loader"></div>
        );
    }
}