import React from 'react'
import { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import authManager from './AuthManager';

export class AuthorizeRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            ready: false
        };
    }

    async componentDidMount() {
        this.setState({ ready: false });
        console.log(authManager.getToken());
        let data = new FormData();
        data.append("Token", authManager.getToken());
        const response = await fetch('/api/user/is-authorized', {
            method: 'POST',
            body: data
        });
        if (response.status === 200) {
            this.setState({ authenticated: true, ready: true });
        } else {
            this.setState({ authenticated: false, ready: true});
        }
    }

    render() {
        const { ready, authenticated } = this.state;
        var link = document.createElement("a");
        link.href = this.props.path;

        let returnUrl = `${link.pathname}${link.search}${link.hash}`;
        if (returnUrl === '/:id' || returnUrl.length === 0) {
            returnUrl = '';
        }
        let redirectUrl = `/auth/login`;
        if (returnUrl.length > 0) {
            redirectUrl += `?returnUrl=${returnUrl}`
        }

        if (!ready) {
            return <div></div>;
        } else {
            const { component: Component, ...rest } = this.props;
            return <Route {...rest}
                render={(props) => {
                    if (authenticated) {
                        return <Component {...props} />
                    } else {
                        return <Redirect to={redirectUrl} />
                    }
                }} />
        }
    }
}
