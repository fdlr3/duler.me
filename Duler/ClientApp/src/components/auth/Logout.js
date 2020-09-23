import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class Logout extends Component {

    constructor(props) {
        super(props);
    }

    async onLogoutClick(e) {
        e.preventDefault();
        let data = new FormData();
        data.append('Token', authManager.getToken());
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            body: data
        });

        if (response.ok) {
            window.location.replace(`${window.location.origin}/auth/login`);
        }
    }

    render() {
        return (
            <div>
                <button onClick={this.onLogoutClick} className="btn btn-primary">
                    Logout
                </button>
            </div>
        );
    }
    
}