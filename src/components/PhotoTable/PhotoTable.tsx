import React, { Dispatch } from 'react';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import HtmlReactParser from 'html-react-parser';
import type { AGClientSocket } from 'socketcluster-client';
import 'core-js/stable';
import { connect } from 'react-redux';
import superagent from 'superagent';
import type { AnyAction } from 'redux';
import mapStoreToProps, { Iimage } from '../../redux/mapStoreToProps';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';

type Pprops = {
  dispatch: Dispatch<AnyAction>,
  picUpdated?: boolean,
  auth: { token: string },
  images: Iimage[],
  scc?: AGClientSocket,
  controller:MusicDashboardController,
};
interface Pstate {
  columns: MUIDataTableColumnDef[]
}
export class PhotoTable extends React.Component<Pprops, Pstate> {
  superagent: superagent.SuperAgentStatic;

  constructor(props: Readonly<Pprops>) {
    super(props);
    this.superagent = superagent;
    this.setColumns = this.setColumns.bind(this);
    this.addThumbs = this.addThumbs.bind(this);
    this.state = {
      columns: [],
    };
  }

  componentDidMount(): void { this.setColumns(); }

  setColumns(): void {
    const columns: MUIDataTableColumnDef[] = [];
    const titles = ['Thumbnail', 'Title', 'Caption', 'Link', 'Type', 'Modify'];
    for (let i = 0; i < titles.length; i += 1) {
      const label = titles[i];// eslint-disable-line security/detect-object-injection
      columns.push({
        name: label.toLowerCase(),
        label,
        options: {
          filter: false,
          sort: true,
          customBodyRender: (value: string) => (
            <div style={{
              margin: 0, fontSize: '12pt', maxWidth: '200px',
            }}
            >
              {label !== 'Modify' ? HtmlReactParser(value) : value}
            </div>
          ),
        },
      });
    }
    this.setState({ columns });
  }

  editPic(editImage: Iimage): boolean {
    const { dispatch } = this.props;
    // eslint-disable-next-line no-param-reassign
    // delete picData.modify;
    dispatch({ type: 'EDIT_PIC', editImage });
    return true;
  }

  addThumbs(arr: Iimage[]): Iimage[] {
    const { controller } = this.props;
    const newArr = arr;/* eslint-disable security/detect-object-injection */
    for (let i = 0; i < arr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
      newArr[i].thumbnail = `<img src=${arr[i].url} width="200px"/>`;
      const deletePicId = `deletePic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      const editPicId = `editPic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      newArr[i].link = `<a href=${arr[i].url} target="_blank">click to view</a>`;// eslint-disable-line security/detect-object-injection
      newArr[i].caption = newArr[i].comments === 'showCaption' ? 'display' : 'hide';
      newArr[i].modify = (// eslint-disable-line security/detect-object-injection
        <div>
          <button
            type="button"
            id={deletePicId}
            onClick={() => {
              controller.deleteData(newArr[i]._id, 'deleteImage');
            }}
          >
            Delete Pic
          </button>
          <p>{' '}</p>
          <button type="button" id={editPicId} onClick={() => { this.editPic(newArr[i]); }}>
            Edit Pic
          </button>
        </div>
      );
    }
    return newArr;
  }

  render(): JSX.Element {
    const { columns } = this.state;
    const {
      images,
    } = this.props;
    let arr: Iimage[] = images;
    arr = this.addThumbs(arr);
    return (
      <div className="photoTable">
        <div style={{ maxWidth: '9in', margin: 'auto' }}>
          <MUIDataTable
            options={{
              filterType: 'dropdown',
              pagination: false,
              responsive: 'standard',
              filter: false,
              download: false,
              search: false,
              print: false,
              viewColumns: false,
              selectableRows: 'none',
              fixedHeader: false,
            }}
            columns={columns}
            data={arr}
            title=""
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStoreToProps, null)(PhotoTable);
