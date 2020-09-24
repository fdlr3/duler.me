import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class DeleteFilesButton extends Component {

    constructor(props) {
        super(props);
        this.submitDeleteButton = this.submitDeleteButton.bind(this);
    }

    async submitDeleteButton(event) {
        if (window.confirm("Are you sure?")) {
            const data = new FormData();
            const ids = this.props.selectedFiles;
            for (let i = 0; i < ids.length; i++)
                data.append(`FileGuids[${i}]`, ids[i])

            let response = await fetch("/api/file/remove-files", {
                method: 'POST',
                body: data,
                headers: {
                    'auth': authManager.getToken()
                }
            });
            if (response.ok)
                this.props.rfunc();
        }
    }

    render() {
        let buttonDisabled = this.props.selectedFiles.length === 0;

        return (
            <button className="btn btn-primary" onClick={this.submitDeleteButton} disabled={buttonDisabled}>
                Delete
            </button>
        );
    }
}