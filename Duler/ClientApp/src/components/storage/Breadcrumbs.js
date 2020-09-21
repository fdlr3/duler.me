import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class Breadcrumbs extends Component {
    constructor(props) {
        super(props);
        this.state = { paths: [], loading: true };
    }

    componentDidMount() {
        this.populateBreadcrumbs();
    }

    render() {
        console.log(this.state.paths.length);
        if (this.state.paths.length === 0)
            return (<div>Loading...</div>);
        return (
            <ul className="breadcrumb">
                {this.state.paths.map(obj =>
                    <li key={obj.item1}>
                        <a href={'/' + obj.item1}>{obj.item2}</a>
                    </li>
                )}
            </ul>
        );
    }


    async populateBreadcrumbs() {
        const response = await fetch(`/api/folder/bread/${this.props.guid}`, {
            headers: {
                'auth': authManager.getToken()
            }
        });
        const data = await response.json();
        this.setState({ paths: data, loading: false });
    }

}