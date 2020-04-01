import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import mapStoreToProps from '../redux/mapStoreToProps';

type TourTableProps = {
  dispatch: (...args: any[]) => any;
  tourUpdated: boolean;
  tour: {}[];
  deleteButton?: boolean;
};
type TourTableState = {
  columns: any[];
};
export class TourTable extends Component<TourTableProps, TourTableState> {
  constructor(props: any) {
    super(props);
    this.setColumns = this.setColumns.bind(this);
    this.getMuiTheme = this.getMuiTheme.bind(this);
    this.checkTourTable = this.checkTourTable.bind(this);
    this.setColumns = this.setColumns.bind(this);
    this.state = { columns: [] };
  }

  componentDidMount() { this.setColumns(); }

  componentDidUpdate(prevProps: any) {
    const { tourUpdated } = this.props;
    return this.checkTourTable(prevProps.tourUpdated, tourUpdated);
  }

  getMuiTheme() { // eslint-disable-line class-methods-use-this
    return createMuiTheme({
      // @ts-ignore
      typography: { useNextVariants: true },
      overrides: {
        // @ts-ignore
        MUIDataTableHeadCell: {
          root: {
            padding: '4px', fontWeight: 'bold', color: 'black', fontSize: '11pt',
          },
        },
        MuiTableRow: { head: { height: '40px' } },
        MuiTableCell: { root: { padding: '4px' } },
        // @ts-ignore
        MUIDataTableToolbar: {
          actions: { display: 'none' },
          root: { paddingLeft: 0, minHeight: 'inherit' },
        },
        MUIDataTable: { responsiveScroll: { maxHeight: '4.3in' } },
        MuiTypography: {
          h6: { color: 'black', fontWeight: 'bold', fontStyle: 'italic' },
        },
      },
    });
  }

  setColumns() {
    const columns = [];
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    for (let i = 0; i < titles.length; i += 1) {
      columns.push({
        name: titles[i].toLowerCase(), // eslint-disable-line security/detect-object-injection
        label: titles[i], // eslint-disable-line security/detect-object-injection
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value: any) => (
            <div style={{ minWidth: '1.3in', margin: 0, fontSize: '12pt' }}>
              {ReactHtmlParser(value)}
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

  render() {
    const { columns } = this.state;
    const { tour } = this.props;
    return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <MuiThemeProvider theme={this.getMuiTheme()}>
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
              data={tour}
              title="Tour"
            />
          </MuiThemeProvider>
        </div>
      </div>
    );
  }
}
export default connect(mapStoreToProps)(TourTable);
