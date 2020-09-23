import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class DownloadFilesButton extends Component {

    constructor(props) {
        super(props);
        this.submitDownloadButton = this.submitDownloadButton.bind(this);
    }


    async submitDownloadButton(e) {
        e.preventDefault();
        const selectedFiles = this.props.selectedFiles;

        if (selectedFiles.length > 0) {
            const data = new FormData();

            selectedFiles.forEach((value, i) => {
                data.append(`FileGuids[${i}]`, value)
            });

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
                console.log(data);
                let responseData = await fetch(`/api/file/download/${data}`, {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*',
                        'auth': authManager.getToken()
                    }
                })
                .then(response => response.blob())
                .then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = "filename.zip";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();      
                });
            }
        }
    }

    render() {
        let buttonDisabled = this.props.selectedFiles.length === 0;

        return (
            <button className="btn btn-primary" onClick={this.submitDownloadButton} disabled={buttonDisabled}>
                Download
            </button>
        );
    }
}