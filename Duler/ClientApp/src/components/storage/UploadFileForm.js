import React, { Component } from 'react';
import authManager from '../auth/AuthManager';
import axios from "axios";

export class UploadFileForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: [],
            uploadPercentage: 0,
            uploadingFile: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSetPercentage = this.handleSetPercentage.bind(this);
    }

    refreshList() {
        this.props.rfunc();
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({ selectedFiles: event.target.files })
    }

    handleSetPercentage(event) {
        this.setState({ uploadPercentage: Math.round((100 * event.loaded) / event.total) });
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({ uploadingFile: true });

        const data = new FormData(event.target);
        const files = this.state.selectedFiles;

        if (files !== undefined) {
            for (let i = 0; i < files.length; i++) {
                data.append(`Files[${i}]`, files[i])
            }

            await axios.create({
                baseURL: window.location.origin,
                headers: {
                    'Content-type': 'application/json'
                }
            }).post('/api/file/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth': authManager.getToken()
                },
                onUploadProgress: this.handleSetPercentage
            });

            this.refreshList();
            this.setState({ selectedFiles: [], uploadingFile: false });
        }
    }

    render() {
        const displayStyle = this.state.uploadingFile ? 'block' : 'none';

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="hidden" name="FolderId" value={this.props.guid} />
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <input type="submit" className="input-group-text" id="inputGroupFileAddon01" value="Upload" disabled={this.state.selectedFiles.length === 0} />
                        </div>
                        <div className="custom-file">
                            <input type="file" name="Files" className="custom-file-input" id="inputGroupFile01"
                                aria-describedby="inputGroupFileAddon01" multiple onChange={this.handleChange} />
                            <label className="custom-file-label" htmlFor="inputGroupFile01">{this.state.selectedFiles.length} files chosen.</label>
                        </div>
                    </div>
                </form>
                <div id="myProgress">
                    <div id="myBar" style={{ width: this.state.uploadPercentage + '%', display: displayStyle }}></div>
                </div>
            </div>
        );
    }

}