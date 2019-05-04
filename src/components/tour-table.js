import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import PropTypes from 'prop-types';
import '@babel/polyfill';
import { connect } from 'react-redux';
import $ from 'jquery';
// import tour from '../tour';

export class TourTable extends Component {// eslint-disable-line import/prefer-default-export
  constructor(props) {
    super(props);
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
    this.columns = [
      {
        name: 'Date',
        label: 'Date',
        options: {
          filter: true,
          sort: true
        }
      },
      {
        name: 'Time',
        label: 'Time',
        options: {
          filter: true,
          sort: false
        }
      },
      {
        name: 'Location',
        label: 'Location',
        options: {
          filter: true,
          sort: false
        }
      },
      {
        name: 'Venue',
        label: 'Venue',
        options: {
          filter: true,
          sort: false
        }
      },
      {
        name: 'Tickets',
        label: 'Tickets',
        options: {
          filter: true,
          sort: false
        }
      }
    ];
  }

  async fetchJson() {
    let json;
    try { json = await $.getJSON('/music/tour.json'); } catch (e) { console.log(e.message); }// eslint-disable-line no-console
    console.log(json); // eslint-disable-line no-console
    this.setState({ data: { tourArr: json } });
    this.shouldComponentUpdate();
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
      Tickets: PropTypes.string
    }))
  })
};
/* istanbul ignore next */
const mapStateToProps = state => ({ data: state });
export default connect(mapStateToProps)(TourTable);
