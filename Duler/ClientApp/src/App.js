import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Main } from './components/storage/Main';
import { Registration } from './components/auth/Registration';
import { Login } from './components/auth/Login';
import { AuthorizeRoute } from './components/auth/AuthorizeRoute';

import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <AuthorizeRoute exact path='/:id?' component={Main} />
                <AuthorizeRoute exact path='/auth/register' component={Registration} />
                <Route exact path='/auth/login' component={Login} />
            </Layout>
        );
    }
}
