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
    this.fetchJson = this.fetchJson.bind(this);
    this.sleep = this.sleep.bind(this);
    // this.jsonArr = [];
    // $.getJSON('/music/tour.json', (json) => {
    //   this.props.data.tourArr = json;
    //   console.log(this.props.data.tourArr);
    // );
    this.fetchJson();
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetchJson() {
    let json;
    try { json = await $.getJSON('/music/tour.json'); } catch (e) { console.log(e.message); }// eslint-disable-line no-console
    console.log(json); // eslint-disable-line no-console
    this.setState({ data: { tourArr: json } });
    this.shouldComponentUpdate();
  }

  // fetchJson() {
  //   $.getJSON('/music/tour.json', (json) => {
  //     console.log(json);
  //     this.setState({ data: { tourArr: json } });
  //     this.shouldComponentUpdate();
  //   });
  // }

  // this.data = {
  //   header: ['Date', 'Time', 'Location', 'Venue', 'Tickets'],
  //   body: [
  //     ['Dec 24, 2018', '4:30 pm', 'Salem, VA', 'College Lutheran Church', 'Freewill'],
  //     ['Dec 16, 2018', '6:00 pm', 'Martinsville, VA', 'St. Joseph Catholic Church, Christmas party', 'Private'],
  //     ['Dec 7, 2018', '6:00 pm', 'Salem, VA', 'College Lutheran Church front porch, prior to the Salem Christmas parade', 'Free'],
  //     ['Nov 29, 2018', '5:45 pm', 'Salem, VA', 'Dinner to Honor Volunteers/Supporters of the Salem Clothes Closet', 'Private'],
  //     ['Nov 24, 2018', '4:45 pm', 'Moneta, VA', 'Resurrection Catholic Church', 'Freewill'],
  //     ['Sept 29, 2018', '5:30 pm', 'Marion, VA',
  //       'Hungry Mother Lutheran Retreat Center Beer & Brats Fundraiser - \n Contact for more info.', 'Donation'],
  //     ['Sept 1, 2018', '4:00 pm', 'Bent Mountain, VA', '33rd Annual Pig Roast', 'Sold Out'],
  //     ['Aug 4, 2018', '9:00 am', 'Salem, VA', 'Farmers Market', 'Free'],
  //     ['July 30, 2018', '6:00 pm', 'Salem, VA', 'Parkway Brewery', 'Free'],
  //     ['July 21, 2018', '5:00 pm', 'Salem, VA', 'Web Jam LLC', 'Private'],
  //     ['July 15, 2018', '9:45 am', 'Salem, VA', 'College Lutheran Church', 'Freewill']
  //   ]
  // };
  // }
  sleep(ms) { // eslint-disable-line class-methods-use-this
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  render() {
    // this.sleep(30000);
    const { data } = this.state;
    // if (data.tourArr === undefined || data.tourArr.length === 0) return this.fetchJson();
    return (
      <div>
        <div style={{ maxWidth: '100%' }}>
          {/* {data.tourArr !== undefined && data.tourArr.length > 0
            ? ( */}
          <MUIDataTable
            options={{ filterType: 'checkbox' }}
            columns={this.columns}
            data={data.tourArr}
            title="Tour"
          />
          {/* ) : null} */}
        </div>
        {/* <div>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '75px' }}>Time</th>
                <th style={{ minWidth: '150px' }}>Location</th>
                <th style={{ minWidth: '220px' }}>Venue</th>
                <th style={{ minWidth: '120px' }}>Tickets</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dec 24, 2018</td>
                <td>4:30 pm</td>
                <td>Salem, VA</td>
                <td><a href="http://collegelutheran.org/" rel="noopener noreferrer" target="_blank">College Lutheran Church</a></td>
                <td>Freewill</td>
              </tr>
              <tr>
                <td>Dec 16, 2018</td>
                <td>6:00 pm</td>
                <td>Martinsville, VA</td>
                <td>
                  <a href="https://stjoechurch.net/" rel="noopener noreferrer" target="_blank">St. Joseph Catholic Church</a>
, Christmas party
                </td>
                <td>Private</td>
              </tr>
              <tr>
                <td>Dec 7, 2018</td>
                <td>6:00 pm</td>
                <td>Salem, VA</td>
                <td>
                  <a href="http://collegelutheran.org/" rel="noopener noreferrer" target="_blank">College Lutheran Church</a>
                  {' '}
            front porch, prior to the Salem Christmas parade
                </td>
                <td>Free</td>
              </tr>
              <tr>
                <td>Nov 29, 2018</td>
                <td>5:45 pm</td>
                <td>Salem, VA</td>
                <td>Dinner to Honor Volunteers/Supporters of the Salem Clothes Closet</td>
                <td>Private</td>
              </tr>
              <tr>
                <td>Nov 24, 2018</td>
                <td>4:45 pm</td>
                <td>Moneta, VA</td>
                <td><a href="http://www.resurrectioncatholic.org/" rel="noopener noreferrer" target="_blank">Resurrection Catholic Church</a></td>
                <td>Freewill</td>
              </tr>
              <tr>
                <td>Sept 29, 2018</td>
                <td>5:30 pm</td>
                <td>Marion, VA</td>
                <td>
Hungry Mother Lutheran Retreat Center
                  <br />
Beer & Brats Fundraiser -
                  {' '}
                  {' '}
                  <a target="_blank" rel="noopener noreferrer" href="http://hungrymother.org/contact-us/">Contact</a>
                  {' '}
for more info.
                </td>
                <td><a target="_blank" rel="noopener noreferrer" href="http://hungrymother.org/give/">Donation</a></td>
              </tr>
              <tr>
                <td>Sept 1, 2018</td>
                <td>4:00 pm</td>
                <td>Bent Mountain, VA</td>
                <td>33rd Annual Pig Roast</td>
                <td>Sold Out</td>
              </tr>
              <tr>
                <td>Aug 4, 2018</td>
                <td>9:00 am</td>
                <td>Salem, VA</td>
                <td><a href="https://www.facebook.com/SalemVaMarket/" rel="noopener noreferrer" target="_blank">Farmers Market</a></td>
                <td>Free</td>
              </tr>
              <tr>
                <td>July 30, 2018</td>
                <td>6:00 pm</td>
                <td>Salem, VA</td>
                <td>
                  <a
                    href="https://www.facebook.com/pages/biz/Majestic-Mic-at-Parkway-Brewery-1146829528673810/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
Parkway Brewery
                  </a>
                </td>
                <td>Free</td>
              </tr>
              <tr>
                <td>July 21, 2018</td>
                <td>5:00 pm</td>
                <td>Salem, VA</td>
                <td>
                  <a href="https://www.facebook.com/events/199874127371694/" rel="noopener noreferrer" target="_blank">Web Jam LLC</a>
                </td>
                <td>Private</td>
              </tr>
              <tr>
                <td>July 15, 2018</td>
                <td>9:45 am</td>
                <td>Salem, VA</td>
                <td><a href="http://collegelutheran.org" rel="noopener noreferrer" target="_blank">College Lutheran Church</a></td>
                <td>Freewill</td>
              </tr>
            </tbody>
          </table>
        </div> */}
      </div>
    );
  }
}
/* istanbul ignore next */
TourTable.defaultProps = { data: { tourArr: [] } };
TourTable.propTypes = {
  // dispatch: PropTypes.func,
  data: PropTypes.shape({
    // isFetching: PropTypes.bool,
    // isError: PropTypes.bool,
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
