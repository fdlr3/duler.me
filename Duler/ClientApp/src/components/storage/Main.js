import React, { Component } from 'react';
import { ListFolder } from './ListFolder';
import { Breadcrumbs } from './Breadcrumbs';
import authManager from '../auth/AuthManager';

export class Main extends Component {
    constructor() {
        super();
        this.state = {
            folderGuid: '',
            pageName: '',
            loading: true
        };
    }

    componentDidMount() {
        this.getFolder(this.props.match.params.id);
    }


    render() {
        if (this.state.loading)
            return <p><em>Loading..</em></p>;

        return (
            <div>
                <h1 className="text-center" id="tabelLabel">{this.state.pageName}</h1> <br />

                <div className="row">
                    <Breadcrumbs guid={this.state.folderGuid} />
                </div>

                <div className="row">
                    <ListFolder guid={this.state.folderGuid} />
                </div>
            </div>
        );
    }


    async getFolder(guid) {
        let bodyGuid = guid === undefined ? '' : guid;

        this.setState({ loading: true });
        const response = await fetch(`/api/folder-info/${bodyGuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth': authManager.getToken()
            }
        });
        const data = await response.json();
        this.setState({ folderGuid: data.id, pageName: data.name, loading: false });
    }
}