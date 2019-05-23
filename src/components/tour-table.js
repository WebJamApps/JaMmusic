import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ReactHtmlParser from 'react-html-parser';
import PropTypes from 'prop-types';
import '@babel/polyfill';
import { connect } from 'react-redux';
import jquery from 'jquery';

export class TourTable extends Component {// eslint-disable-line import/prefer-default-export
  constructor(props) {
    super(props);
    this.jquery = jquery;
    this.state = { data: {} };
    this.columns = [];
    this.setColumns = this.setColumns.bind(this);
    this.fetchJson = this.fetchJson.bind(this);
    this.getMuiTheme = this.getMuiTheme.bind(this);
    this.setColumns();
    this.fetchJson();
  }

  shouldComponentUpdate() {
    return true;
  }

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
        MUIDataTable: { responsiveScroll: { maxHeight: '2.75in' } },
        MuiTypography: { h6: { color: 'black', fontWeight: 'bold', fontStyle: 'italic' } },
      },
    });
  }

  setColumns() {
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    for (let i = 0; i < titles.length; i += 1) {
      this.columns.push({
        name: titles[i], // eslint-disable-line security/detect-object-injection
        label: titles[i], // eslint-disable-line security/detect-object-injection
        options: {
          filter: false,
          sort: false,
          customBodyRender: value => (
            <p style={{ margin: 0, fontSize: 'inherit' }}>
              { ReactHtmlParser(value) }
            </p>
          ),
        },
      });
    }
  }

  async fetchJson() {
    let json;
    try { json = await this.jquery.getJSON('/music/tour.json'); } catch (e) {
      console.log(e.message); // eslint-disable-line no-console
      return Promise.resolve(false);
    }
    this.setState({ data: { tourArr: json } });
    this.shouldComponentUpdate();
    return Promise.resolve(true);
  }

  render() {
    const { data } = this.state;
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
              data={data.tourArr}
              title="Tour"
            />
          </MuiThemeProvider>
        </div>
      </div>
    );
  }
}
TourTable.defaultProps = { data: { tourArr: [] } };
TourTable.propTypes = {
  data: PropTypes.shape({
    tourArr: PropTypes.arrayOf(PropTypes.shape({
      Date: PropTypes.string,
      Time: PropTypes.string,
      Location: PropTypes.string,
      Venue: PropTypes.string,
      Tickets: PropTypes.string,
    })),
  }),
};
/* istanbul ignore next */
const mapStateToProps = state => ({ data: state });
export default connect(mapStateToProps)(TourTable);
