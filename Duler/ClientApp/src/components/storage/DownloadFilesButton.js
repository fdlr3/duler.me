import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class DownloadFilesButton extends Component {

    constructor(props) {
        super(props);
        this.submitDownloadButton = this.submitDownloadButton.bind(this);
    }

    async submitDownloadButton(event) {
        const data = new FormData();
        const ids = this.props.fileGuids();
        for (let i = 0; i < ids.length; i++) {
            data.append(`FileGuids[${i}]`, ids[i])
        }

        console.log(ids);
        let response = await fetch("/api/file/prepare-download", {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json',
                'auth': authManager.getToken()
            }
        });
        if (response.ok) {
            let data = await response.json();

            const link = document.createElement('a');
            link.href = `/api/file/download/${data}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    render() {
        return (
            <button className="btn btn-primary" onClick={this.submitDownloadButton}>
                Download
            </button>
        );
    }
}