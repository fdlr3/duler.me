import React, { Component } from 'react';
import authManager from './AuthManager';

export class Login extends Component {
    constructor(props) {
        super(props);

        this.handleFormOnSubmit = this.handleFormOnSubmit.bind(this);
    }

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

            let url = new URL(window.location.href);
            let c = url.searchParams.get("returnUrl");
            if (c === null) c = '';

            window.location.replace(`${window.location.origin}/${c}`);
        }
    }

    render() {
        return (
            <div className="form-control">
                <form onSubmit={this.handleFormOnSubmit}>
                    <div className="input-group">
                        <label>Username:</label>
                        <input type="text" name="Username" required />
                    </div>

                    <div className="input-group">
                        <label>Password:</label>
                        <input type="password" name="Password" required />
                    </div>

                    <div className="input-group">
                        <input className="btn btn-primary" type="submit" value="Login" />
                    </div>
                </form>
            </div>
        );
    }

    //getReturnUrl(state) {
    //    const params = new URLSearchParams(window.location.search);
    //    const fromQuery = params.get(QueryParameterNames.ReturnUrl);
    //    if (fromQuery && !fromQuery.startsWith(`${window.location.origin}/`)) {
    //        // This is an extra check to prevent open redirects.
    //        throw new Error("Invalid return url. The return url needs to have the same origin as the current page.")
    //    }
    //    return (state && state.returnUrl) || fromQuery || `${window.location.origin}/`;
    //}

}