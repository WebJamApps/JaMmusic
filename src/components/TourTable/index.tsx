import React, { Component, Dispatch } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import { AGClientSocket } from 'socketcluster-client';
import { AnyAction } from 'redux';
import mapStoreToProps, { Tour } from '../../redux/mapStoreToProps';

type TourTableProps = {
  dispatch: Dispatch<AnyAction>;
  tourUpdated?: boolean;
  tour?: Tour[];
  auth?: { token: string };
  deleteButton?: boolean;
  scc?: AGClientSocket
};
type TourTableState = {
  columns: MUIDataTableColumn[];
};
export class TourTable extends Component<TourTableProps, TourTableState> {
  constructor(props: TourTableProps) {
    super(props);
    this.setColumns = this.setColumns.bind(this);
    this.checkTourTable = this.checkTourTable.bind(this);
    this.setColumns = this.setColumns.bind(this);
    this.state = { columns: [] };
    this.addDeleteButton = this.addDeleteButton.bind(this);
  }

  componentDidMount(): void { this.setColumns(); }

  componentDidUpdate(prevProps: TourTableProps): boolean {
    const { tourUpdated } = this.props;
    return this.checkTourTable(prevProps.tourUpdated || false, tourUpdated || false);
  }

  setColumns(): void {
    const { deleteButton } = this.props;
    const columns:MUIDataTableColumn[] = [];
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    if (deleteButton) titles.push('Modify');
    for (let i = 0; i < titles.length; i += 1) {
      const label = titles[i];// eslint-disable-line security/detect-object-injection
      columns.push({
        name: label.toLowerCase(),
        label,
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value:string) => (
            <div style={{ minWidth: '1.3in', margin: 0, fontSize: '12pt' }}>
              {label !== 'Modify' ? ReactHtmlParser(value) : value}
            </div>
          ),
        },
      });
    }
    this.setState({ columns });
  }

  checkTourTable(pTupdated: boolean, nTupdated: boolean): boolean {
    if (!pTupdated && nTupdated) {
      const { dispatch } = this.props;
      dispatch({ type: 'RESET_TOUR' });
      this.setState({ columns: [] });
      this.setColumns();
      return true;
    }
    return false;
  }

  deleteTour(tourId: string | undefined): boolean { // eslint-disable-next-line no-restricted-globals
    const result = confirm('Deleting Event, are you sure?');// eslint-disable-line no-alert
    if (result) {
      const { scc, auth } = this.props;
      const tour = { tourId };
      if (scc && auth) {
        scc.transmit('deleteTour', { tour, token: auth.token });
        window.location.assign('/music');
        return true;
      } return false;
    } return false;
  }

  editTour(data: Tour): boolean {
    const { dispatch } = this.props;
    dispatch({ type: 'EDIT_TOUR', data });
    return true;
  }

  addDeleteButton(arr: Tour[]):Tour[] {
    const newArr = arr;/* eslint-disable security/detect-object-injection */
    for (let i = 0; i < arr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
      const deletePicId = `deletePic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      const editPicId = `editPic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      newArr[i].modify = (// eslint-disable-line security/detect-object-injection
        <div>
          <button type="button" id={deletePicId} onClick={() => this.deleteTour(newArr[i]._id)}>Delete Event</button>
          <p>{' '}</p>
          <button type="button" id={editPicId} onClick={() => this.editTour(newArr[i])}>Edit Event</button>
        </div>
      );
    }
    return newArr;
  }

  render(): JSX.Element {
    const { columns } = this.state;
    const { tour, deleteButton } = this.props;
    let tableData = tour || [];
    if (deleteButton) tableData = this.addDeleteButton(tableData);
    return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <MUIDataTable
            options={{
              filterType: 'dropdown',
              pagination: false,
              responsive: 'scrollMaxHeight',
              filter: false,
              download: false,
              search: false,
              print: false,
              viewColumns: false,
              selectableRows: 'none',
              fixedHeader: false,
            }}
            columns={columns}
            data={tableData}
            title="Tour"
          />
        </div>
      </div>
    );
  }
}
export default connect(mapStoreToProps)(TourTable);
