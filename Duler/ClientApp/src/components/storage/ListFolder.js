import React, { Component } from 'react';
import { UploadFileForm } from './files/UploadFileForm';
import { DownloadFilesButton } from './files/DownloadFilesButton';
import { DeleteFilesButton } from './files/DeleteFilesButton';
import { DisplayFile } from './files/DisplayFile';
import { EditFolderForm } from './folders/EditFolderForm';
import { Loader } from '../Loader';
import authManager from '../auth/AuthManager';
import { DisplayFolder } from './folders/DisplayFolder';
import { SearchBar } from './SearchBar';

export class ListFolder extends Component {
    static displayName = ListFolder.name;

    constructor(props) {
        super(props);
        this.state = {
            checkedValues: [],
            data: [],
            loading: true
        };
        this.refreshObjects = this.refreshObjects.bind(this);
        this.handleCheckboxClick = this.handleCheckboxClick.bind(this);
        this.getCheckedValues = this.getCheckedValues.bind(this);

        this.getItems = this.getItems.bind(this);
        this.setItems = this.setItems.bind(this);
    }

    static sortData(list) {
        return list
            .sort((a, b) => (a.name > b.name) ? 1 : -1)
            .sort((a, b) => (a.type > b.type) ? -1 : 1);
    }

    getItems() {
        return this.state.data;
    }

    setItems(list) {
        this.setState({ data: ListFolder.sortData(list) });
    }


    refreshObjects() {
        this.getFolder();
    }

    componentDidMount() {
        this.getFolder();
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


    static RenderObject(obj, ref) {
        if (obj.type === 0 && !obj.hidden) { //file
            return <DisplayFile
                key={obj.id}
                id={obj.id}
                name={obj.name}
                handleClick={ref.handleCheckboxClick}
            />;
        } else if (obj.type === 1 && !obj.hidden) { //folder
            return <DisplayFolder
                key={obj.id}
                id={obj.id}
                name={obj.name}
                guid={ref.props.guid}
                getItems={ref.getItems}
                setItems={ref.setItems}
            />;
        }
    }

    static renderFilesTable(files, ref) {
        return (
            <table className="table table-hover" aria-labelledby="tabelLabel">
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
            <Loader /> :
            ListFolder.renderFilesTable(this.state.data, this);


        return (
            <div>
                <div>
                    <SearchBar
                        getItems={this.getItems}
                        setItems={this.setItems}
                    />
                </div>

                <div className="dropdown show">
                    <a href="#nogo" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-three-dots" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                    </a>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <EditFolderForm
                            btnClass="dropdown-item"
                            guid={this.props.guid}
                            getItems={this.getItems}
                            setItems={this.setItems}>
                            Add folder
                        </EditFolderForm>

                        <UploadFileForm btnClass="dropdown-item" guid={this.props.guid} rfunc={this.refreshObjects}>
                            Add files
                        </UploadFileForm>

                        <DeleteFilesButton
                            btnClass="dropdown-item"
                            selectedFiles={this.state.checkedValues}
                            getItems={this.getItems}
                            setItems={this.setItems}>
                            Delete
                        </DeleteFilesButton>

                        <DownloadFilesButton btnClass="dropdown-item" selectedFiles={this.state.checkedValues}>
                            Download
                        </DownloadFilesButton>
                    </div>
                </div>

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
        this.setState({ data: ListFolder.sortData(data), loading: false });
    }
}
