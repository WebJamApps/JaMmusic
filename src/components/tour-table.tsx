import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import { MuiThemeProvider } from '@material-ui/core/styles';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import mapStoreToProps from '../redux/mapStoreToProps';
// eslint-disable-next-line node/no-missing-import
import TableTheme from '../lib/tourTableTheme';

type TourTableProps = {
  dispatch: (...args: any[]) => any;
  tourUpdated: boolean;
  tour: {}[];
  auth: {token: string};
  deleteButton?: boolean;
  scc: {transmit: (...args: any[]) => any};
};
type TourTableState = {
  columns: any[];
};
export class TourTable extends Component<TourTableProps, TourTableState> {
  constructor(props: any) {
    super(props);
    this.setColumns = this.setColumns.bind(this);
    // this.getMuiTheme = this.getMuiTheme.bind(this);
    this.checkTourTable = this.checkTourTable.bind(this);
    this.setColumns = this.setColumns.bind(this);
    this.state = { columns: [] };
    this.addDeleteButton = this.addDeleteButton.bind(this);
  }

  componentDidMount() { this.setColumns(); }

  componentDidUpdate(prevProps: any) {
    const { tourUpdated } = this.props;
    return this.checkTourTable(prevProps.tourUpdated, tourUpdated);
  }

  setColumns() {
    const { deleteButton } = this.props;
    const columns = [];
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    if (deleteButton)titles.push('Modify');
    for (let i = 0; i < titles.length; i += 1) {
      const label = titles[i];// eslint-disable-line security/detect-object-injection
      columns.push({
        name: label.toLowerCase(),
        label,
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value: any) => (
            <div style={{ minWidth: '1.3in', margin: 0, fontSize: '12pt' }}>
              {label !== 'Modify' ? ReactHtmlParser(value) : value}
            </div>
          ),
        },
      });
    }
    this.setState({ columns });
  }

  checkTourTable(pTupdated: any, nTupdated: boolean) {
    if (!pTupdated && nTupdated) {
      const { dispatch } = this.props;
      dispatch({ type: 'RESET_TOUR' });
      this.setState({ columns: [] });
      this.setColumns();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  deleteTour(tourId: string) { // eslint-disable-next-line no-restricted-globals
    const result = confirm('Deleting Event, are you sure?');// eslint-disable-line no-alert
    if (result) {
      const { scc, auth } = this.props;
      const tour = { tourId };
      scc.transmit('deleteTour', { tour, token: auth.token });
      window.location.assign('/music');
      return true;
    } return false;
  }

  editTour(data: {}) {
    const { dispatch } = this.props;
    dispatch({ type: 'EDIT_TOUR', data });
    return true;
  }

  addDeleteButton(arr: any) {
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

  render() {
    const { columns } = this.state;
    const { tour, deleteButton } = this.props;
    let tableData = tour;
    if (deleteButton)tableData = this.addDeleteButton(tableData);
    return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <MuiThemeProvider theme={TableTheme}>
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
          </MuiThemeProvider>
        </div>
      </div>
    );
  }
}
export default connect(mapStoreToProps)(TourTable);
