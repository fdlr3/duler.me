import React, { Component } from 'react';
import authManager from './AuthManager';

export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
        this.handleFormOnSubmit = this.handleFormOnSubmit.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleUsernameChange(e) { this.setState({ username: e.target.value }); }
    handlePasswordChange(e) { this.setState({ password: e.target.value }); }

    async handleFormOnSubmit(e) {
        e.preventDefault();

        let data = new FormData(e.target);

        let response = await fetch('/api/user/login', {
            method: 'POST',
            body: data,
            headers: {
                "Accept": "application/json"
            }
        });

        let responseData = await response.json();
        if (response.ok) {
            authManager.setToken(responseData);
            authManager._isAuthenticated = true;
            authManager._user = this.state.username;

            let url = new URL(window.location.href);
            let c = url.searchParams.get("returnUrl");
            if (c === null) c = '';

            window.location.replace(`${window.location.origin}/${c}`);
        }
    }

    render() {
        return (
            <form onSubmit={this.handleFormOnSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" name="Username" onChange={this.handleUsernameChange} className="form-control" required />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" name="Password" onChange={this.handlePasswordChange} className="form-control" required />
                </div>

                <div className="form-group">
                    <input className="btn btn-primary" type="submit" value="Login" />
                </div>
            </form>
        );
    }
}