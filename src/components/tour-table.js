import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ReactHtmlParser from 'react-html-parser';
import PropTypes from 'prop-types';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { connect } from 'react-redux';
import mapStoreToProps from '../redux/mapStoreToProps';

export class TourTable extends Component {
  constructor(props) {
    super(props);
    this.columns = [];
    this.setColumns = this.setColumns.bind(this);
    this.getMuiTheme = this.getMuiTheme.bind(this);
    this.setColumns();
  }

  // shouldComponentUpdate() {
  //   return true;
  // }

  getMuiTheme() { // eslint-disable-line class-methods-use-this
    return createMuiTheme({
      typography: {
        useNextVariants: true,
      },
      overrides: {
        MUIDataTableHeadCell: {
          root: {
            padding: '4px', fontWeight: 'bold', color: 'black', fontSize: '11pt',
          },
        },
        MuiTableRow: { head: { height: '40px' } },
        MuiTableCell: { root: { padding: '4px' } },
        MUIDataTableToolbar: { actions: { display: 'none' }, root: { paddingLeft: 0, minHeight: 'inherit' } },
        MUIDataTable: { responsiveScroll: { maxHeight: '4.3in' } },
        MuiTypography: { h6: { color: 'black', fontWeight: 'bold', fontStyle: 'italic' } },
      },
    });
  }

  setColumns() {
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    for (let i = 0; i < titles.length; i += 1) {
      this.columns.push({
        name: titles[i].toLowerCase(), // eslint-disable-line security/detect-object-injection
        label: titles[i], // eslint-disable-line security/detect-object-injection
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => (
            <div style={{ minWidth: '1.3in' }}>
              <p style={{ margin: 0, fontSize: 'inherit' }}>
                { ReactHtmlParser(value) }
              </p>
            </div>
          ),
        },
      });
    }
  }

  render() {
    const { tour } = this.props;
    return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <MuiThemeProvider theme={this.getMuiTheme()}>
            <MUIDataTable
              options={{
                filterType: 'dropdown',
                pagination: false,
                responsive: 'scroll',
                filter: false,
                download: false,
                search: false,
                print: false,
                viewColumns: false,
                selectableRows: 'none',
                fixedHeader: false,
              }}
              columns={this.columns}
              data={tour}
              title="Tour"
            />
          </MuiThemeProvider>
        </div>
      </div>
    );
  }
}
// TourTable.defaultProps = { data: { tourArr: [] } };
TourTable.propTypes = {
  tour: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  // data: PropTypes.shape({
  //   tourArr: PropTypes.arrayOf(PropTypes.shape({
  //     Date: PropTypes.string,
  //     Time: PropTypes.string,
  //     Location: PropTypes.string,
  //     Venue: PropTypes.string,
  //     Tickets: PropTypes.string,
  //   })),
  // }),
};

export default connect(mapStoreToProps)(TourTable);
