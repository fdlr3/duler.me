import React, { Component } from 'react';
import authManager from '../auth/AuthManager';

export class EditFolderForm extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    }

    refreshList() {
        this.props.rfunc();
    }

    componentDidMount() {
        let editableDiv = document.getElementById("editFolderName");
        editableDiv.focus();
    }


    async handleSaveButtonClick(event) {
        event.preventDefault();
        

        let newName = document.getElementById("editFolderName").innerHTML;
        console.log(this.props.guid);
        console.log(newName);

        if (newName !== undefined && newName.length > 0) {
            let data = new FormData();

            if (this.props.folderId !== undefined) {
                data.append("DestinationFolderId", this.props.folderId);
            }

            data.append("CurrentFolderId", this.props.guid);
            data.append("Name", newName);

            await fetch('/api/folder', {
                method: 'POST',
                body: data,
                headers: {
                    'auth': authManager.getToken()
                }
            });
            this.refreshList();

        }

        
    }

    render() {
        return (
            <tr key="0">
                <th><div id="editFolderName" className="btn btn-danger" contentEditable>{this.props.folderName}</div></th>
                <th></th>
                <th><button className="btn btn-primary" onClick={this.handleSaveButtonClick}>Save</button></th>
            </tr>
            );
    }

}