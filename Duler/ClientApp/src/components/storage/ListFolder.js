import React, { Component } from 'react';
import { EditFolderForm } from './EditFolderForm';
import { UploadFileForm } from './UploadFileForm';
import { DownloadFilesButton } from './DownloadFilesButton';
import { DeleteFilesButton } from './DeleteFilesButton';
import { Loader } from '../Loader';
import authManager from '../auth/AuthManager';

export class ListFolder extends Component {
    static displayName = ListFolder.name;

    constructor(props) {
        super(props);
        this.state = {
            checkedValues: [],
            data: {},
            loading: true
        };
        this.refreshObjects = this.refreshObjects.bind(this);
        this.handleRemoveFolderClick = this.handleRemoveFolderClick.bind(this);
        this.handleCheckboxClick = this.handleCheckboxClick.bind(this);
        this.getCheckedValues = this.getCheckedValues.bind(this);
        this.handleAddFolderButton = this.handleAddFolderButton.bind(this);
        this.handleEditFolderButton = this.handleEditFolderButton.bind(this);
    }

    refreshObjects() {
        console.log('refreshing!');
        this.getFolder();
    }

    componentDidMount() {
        this.getFolder();
    }

    async handleRemoveFolderClick(event) {
        event.preventDefault();

        if (window.confirm("Are you sure?")) {
            await fetch('/api/folder/' + event.target.value, {
                method: 'POST',
                headers: {
                    'auth': authManager.getToken()
                }
            });
            this.refreshObjects();
        }
    }

    getCheckedValues() {
        return this.state.checkedValues;
    }

    handleCheckboxClick(event) {
        let value = event.target.value;
        let curValues = this.state.checkedValues;
        curValues = curValues.includes(value) ? curValues.filter(i => i !== value) : [...curValues, value];
        this.setState({
            checkedValues: curValues,
            data: this.state.data,
            loading: this.state.loading
        });
    }

    handleAddFolderButton() {
        let newData = Object.assign(this.state.data);

        newData = [{ id: '', name: '', type: 2 }, ...this.state.data];
        this.setState({
            checkedValues: this.state.checkedValues,
            data: newData,
            loading: false
        });
    }

    handleEditFolderButton(event) {
        //event.preventDefault();
        console.log(event.target.value);
        let selectedFolder = this.state.data.filter(obj => obj.id === event.target.value)[0];
        console.log(selectedFolder);

        if (selectedFolder !== undefined) {
            let data = Object.assign(this.state.data);
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === event.target.value) {
                    data[i].type = 3;
                }
            }
            this.setState({
                checkedValues: this.state.checkedValues,
                data: data,
                loading: false
            });
        }
    }

    static RenderObject(obj, ref) {
        if (obj.type === 0) { //file
            return <tr key={obj.id}>
                <td><input type="checkbox" value={obj.id} onClick={ref.handleCheckboxClick} /></td>
                <td>{obj.name}</td>
                <td></td>
            </tr>;
        } else if (obj.type === 1) { //folder
            return <tr key={obj.id} className="no-hover">
                <td colSpan="2"><a className="btn btn-primary" href={'/' + obj.id}>{obj.name}</a></td>
                <td>
                    <button className="btn btn-warning" value={obj.id} onClick={ref.handleEditFolderButton}>Edit</button>
                    <button className="btn btn-danger" value={obj.id} onClick={ref.handleRemoveFolderClick}>Remove</button>
                </td>
            </tr>;
        } else if (obj.type === 2) { //new folder
            return <EditFolderForm guid={ref.props.guid} rfunc={ref.refreshObjects} />;
        } else if (obj.type === 3) { //edit folder
            return <EditFolderForm guid={ref.props.guid} folderId={obj.id} folderName={obj.name} rfunc={ref.refreshObjects} />;
        }
    }

    static renderFilesTable(files, ref) {
        return (
            <table className='table table-hover' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(obj =>
                        ListFolder.RenderObject(obj, ref)
                    )}
                </tbody>
            </table>
        );
    }


    render() {
        let context = this.state.loading ?
            <Loader/> :
            ListFolder.renderFilesTable(this.state.data, this);

        return (
            <div>
                <UploadFileForm guid={this.props.guid} rfunc={this.refreshObjects} />
                <button className="btn btn-primary" onClick={this.handleAddFolderButton}>Add folder</button>
                <DownloadFilesButton selectedFiles={this.state.checkedValues} />
                <DeleteFilesButton selectedFiles={this.state.checkedValues} rfunc={this.refreshObjects} />
                <div>
                    {context}
                </div>
            </div>
        );
    }


    async getFolder() {
        this.setState({ loading: true });
        const response = await fetch(`/api/folder/${this.props.guid}`, {
            headers: {
                'auth': authManager.getToken()
            }
        });
        const data = await response.json();
        
        //push new folder
        data.push({
            id: '00000000-0000-0000-0000-000000000000',
            name: '',
            type: -1
        });
        this.setState({ data: data, loading: false });
    }
}
