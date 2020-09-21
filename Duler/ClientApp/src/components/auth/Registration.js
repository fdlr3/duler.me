import React, { Component } from 'react';

export class Registration extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            passwordConfirm: '',
            passwordConfirmError: ''
        };

        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    }

    async handleRegisterSubmit(e) {
        e.preventDefault();
        let data = new FormData(e.target);

        data.append("Username", this.state.username);
        data.append("Password", this.state.password);

        let response = await fetch('/api/user/register', {
            method: 'POST',
            body: data
        });

        if (response.ok) {
            alert("success");
        } else {
            alert("failed");
        }


    }

    handleUsernameChange(e) { this.setState({ username: e.target.value }); }
    handlePasswordChange(e) { this.setState({ password: e.target.value }); }
    handleConfirmPasswordChange(e) {
        this.setState({ passwordConfirm: e.target.value });

        if (this.state.password !== e.target.value) {
            this.setState({passwordConfirmError: 'Password doesnt match!'});
        } else {
            this.setState({ passwordConfirmError: '' });
        }
    }

    render() {
        return (
            <div className="form-control">
                <form onSubmit={this.handleRegisterSubmit}>

                    <div className="input-group">
                        <label>Username:</label>
                        <input type="text" name="Username" value={this.state.username} onChange={this.handleUsernameChange} required />
                    </div>

                    <div className="input-group">
                        <label>Password:</label>
                        <input id="passwordInput" type="password" name="Password" value={this.state.password} onChange={this.handlePasswordChange} required />
                    </div>

                    <div className="input-group">
                        <label>Confirm password:</label>
                        <input type="password" name="PasswordConfirm" onChange={this.handleConfirmPasswordChange} value={this.state.passwordConfirm} required />
                        <span>{this.state.passwordConfirmError}</span>
                    </div>

                    <div className="input-group">
                        <input type="submit" value="Register" />
                    </div>

                </form>
            </div>
        );
    }
}