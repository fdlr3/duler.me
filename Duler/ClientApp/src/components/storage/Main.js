import React, { Component } from 'react';
import { ListFolder } from './ListFolder';
import { Breadcrumbs } from './Breadcrumbs';
import authManager from '../auth/AuthManager';

export class Main extends Component {
    constructor() {
        super();
        this.state = {
            routeId: '',
            loading: true
        };
    }

    componentDidMount() {
        if (this.state.routeId.length === 0) {
            let tempGuid = this.props.match.params.id;
            if (tempGuid !== undefined && tempGuid.length > 0) {
                this.setState({ routeId: tempGuid, loading: false });
            }
            else {
                this.getFolder();
            }
        }    
    }


    render() {
        if (this.state.loading)
            return <p><em>Loading..</em></p>;

        return (
            <div>
                <h1 id="tabelLabel">Storage</h1> <br/>

                <div className="row">
                    <Breadcrumbs guid={this.state.routeId} />
                </div>

                <div className="row">
                    <ListFolder guid={this.state.routeId} />
                </div>
            </div>
        );
    }


    async getFolder() {
        const response = await fetch('/api/folder/root', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth': authManager.getToken()
            }
        });
        console.log(response);
        const routeId = await response.json();
        this.setState({ routeId: routeId, loading: false });
    }
}