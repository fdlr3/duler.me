import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class UploadFileForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: []
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    refreshList() {
        this.props.rfunc();
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({ selectedFiles: event.target.files })
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const data = new FormData(event.target);
        const files = this.state.selectedFiles;

        if (files !== undefined) {
            for (let i = 0; i < files.length; i++) {
                data.append(`Files[${i}]`, files[i])
            }

            await fetch("/api/file/upload", {
                method: 'POST',
                body: data,
                headers: {
                    'auth': authManager.getToken()
                }
            });
            this.props.rfunc();
            this.setState({ selectedFiles: []});
        }
    }

    render() {
        const uploadDisabled = this.state.selectedFiles.length === 0;

        return (
            <form onSubmit={this.handleSubmit}>
                <input type="hidden" name="FolderId" value={this.props.guid} />
                <div className="input-group">
                    <div className="input-group-prepend">
                        <input type="submit" className="input-group-text" id="inputGroupFileAddon01" value="Upload" disabled={uploadDisabled}/>
                    </div>
                    <div className="custom-file">
                        <input type="file" name="Files" className="custom-file-input" id="inputGroupFile01"
                            aria-describedby="inputGroupFileAddon01" multiple onChange={this.handleChange} />
                        <label className="custom-file-label" htmlFor="inputGroupFile01">{this.state.selectedFiles.length} files chosen.</label>
                    </div>
                </div>
            </form>
        );
    }

}