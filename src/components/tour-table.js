import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import ReactHtmlParser from 'react-html-parser';
import PropTypes from 'prop-types';
import '@babel/polyfill';
import { connect } from 'react-redux';
import jquery from 'jquery';
// import tour from '../tour';

export class TourTable extends Component {// eslint-disable-line import/prefer-default-export
  constructor(props) {
    super(props);
    this.jquery = jquery;
    this.state = { data: {} };
    this.columns = [];
    this.setColumns = this.setColumns.bind(this);
    this.fetchJson = this.fetchJson.bind(this);
    this.setColumns();
    this.fetchJson();
  }

  shouldComponentUpdate() {
    return true;
  }

  setColumns() {
    const titles = ['Date', 'Time', 'Location', 'Venue', 'Tickets'];
    for (let i = 0; i < titles.length; i += 1) {
      this.columns.push({
        name: titles[i], // eslint-disable-line security/detect-object-injection
        label: titles[i], // eslint-disable-line security/detect-object-injection
        options: {
          filter: false,
          sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            console.log(tableMeta);// eslint-disable-line no-console
            console.log(updateValue);// eslint-disable-line no-console
            return (
              <p>
                { ReactHtmlParser(value) }
              </p>
            );
          },
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
    console.log(json); // eslint-disable-line no-console
    this.setState({ data: { tourArr: json } });
    this.shouldComponentUpdate();
    return Promise.resolve(true);
  }

  render() {
    const { data } = this.state;
    return (
      <div className="tourTable">
        <div style={{ maxWidth: '100%' }}>
          <MUIDataTable
            options={{ filterType: 'checkbox' }}
            columns={this.columns}
            data={data.tourArr}
            title="Tour"
          />
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
