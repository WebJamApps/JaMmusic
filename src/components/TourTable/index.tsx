import React, { Component, Dispatch } from 'react';
import { TableCell } from '@material-ui/core';
import type { MUIDataTableColumn } from 'mui-datatables';
import HtmlReactParser from 'html-react-parser';
import { connect } from 'react-redux';
import type { AGClientSocket } from 'socketcluster-client';
import type { AnyAction } from 'redux';
import mapStoreToProps, { Tour } from '../../redux/mapStoreToProps';
import DTable from './DataTable';

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
    this.state = { columns: [] };
    this.addDeleteButton = this.addDeleteButton.bind(this);
  }

  componentDidMount(): void { this.setColumns(); }

  componentDidUpdate(prevProps: TourTableProps): boolean {
    const { tourUpdated } = this.props;
    return this.checkTourTable(prevProps.tourUpdated || false, tourUpdated || false);
  }

  makeColumns(titles:string[]): MUIDataTableColumn[]{
    const columns: MUIDataTableColumn[] = [];
    for (let i = 0; i < titles.length; i += 1) {
      const label = titles[i];// eslint-disable-line security/detect-object-injection
      columns.push({
        name: label.toLowerCase(),
        label,
        options: {
          filter: false,
          sort: false,
          customHeadRender: ({ index, ...column }) => (
            <TableCell key={index} style={{ fontWeight: 'bold', width: column.label === 'Time' ? '20px' : 'auto' }}>
              {column.label}
            </TableCell>
          ),
          customBodyRender: (value:any) => {
            if (typeof value !== 'string' && label !== 'Modify') value = '';
            return (
            <div style={{ minWidth: '.65in', margin: 0, fontSize: '12pt' }}>
              {label !== 'Modify' ? HtmlReactParser(value) : value}
            </div>
            );
          },
        },
      });
    }
    return columns;
  }

  setColumns(): void {
    const { deleteButton } = this.props;
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    if (deleteButton) titles.push('Modify');
    const columns = this.makeColumns(titles);
    this.setState({ columns });
  }

  checkTourTable(pTupdated: boolean, nTupdated: boolean): boolean {
    if (!pTupdated && nTupdated) {
      const { dispatch } = this.props;
      this.setState({ columns: [] });
      this.setColumns();
      dispatch({ type: 'RESET_TOUR' });
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
    // eslint-disable-next-line no-console
    console.log(data);
    // eslint-disable-next-line no-param-reassign
    delete data.modify;
    dispatch({ type: 'EDIT_TOUR', data });
    return true;
  }

  addDeleteButton(arr: Tour[]): Tour[] {
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
    if (tableData.length > 0 ){ 
      return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 0 }}>Tour Schedule</h4>
          <DTable columns={columns} data={tableData} />
        </div>
      </div>
      );
    } return (<div className="noTourData"></div>);
  }
}
export default connect(mapStoreToProps)(TourTable);
