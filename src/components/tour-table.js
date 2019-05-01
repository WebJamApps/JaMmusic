import React, { Component } from 'react';

export class TourTable extends Component {// eslint-disable-line import/prefer-default-export
  constructor(props) {
    super(props);
    this.data = {
      header: ['Date', 'Time', 'Location', 'Venue', 'Tickets'],
      body: [
        ['Dec 24, 2018', '4:30 pm', 'Salem, VA', 'College Lutheran Church', 'Freewill'],
        ['Dec 16, 2018', '6:00 pm', 'Martinsville, VA', 'St. Joseph Catholic Church, Christmas party', 'Private'],
        ['Dec 7, 2018', '6:00 pm', 'Salem, VA', 'College Lutheran Church front porch, prior to the Salem Christmas parade', 'Free'],
        ['Nov 29, 2018', '5:45 pm', 'Salem, VA', 'Dinner to Honor Volunteers/Supporters of the Salem Clothes Closet', 'Private'],
        ['Nov 24, 2018', '4:45 pm', 'Moneta, VA', 'Resurrection Catholic Church', 'Freewill'],
        ['Sept 29, 2018', '5:30 pm', 'Marion, VA',
          'Hungry Mother Lutheran Retreat Center Beer & Brats Fundraiser - \n Contact for more info.', 'Donation'],
        ['Sept 1, 2018', '4:00 pm', 'Bent Mountain, VA', '33rd Annual Pig Roast', 'Sold Out'],
        ['Aug 4, 2018', '9:00 am', 'Salem, VA', 'Farmers Market', 'Free'],
        ['July 30, 2018', '6:00 pm', 'Salem, VA', 'Parkway Brewery', 'Free'],
        ['July 21, 2018', '5:00 pm', 'Salem, VA', 'Web Jam LLC', 'Private'],
        ['July 15, 2018', '9:45 am', 'Salem, VA', 'College Lutheran Church', 'Freewill']
      ]
    };
  }

  render() {
    return (
      <div>
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
      </div>
    );
  }
}
