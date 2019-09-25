import React, { Component } from 'react';
import moment from 'moment';
import { withRouter, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import mapStoreToProps from '../../redux/mapStoreToProps';

export class MusicDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      date: '',
      time: '',
      tickets: '',
      more: '',
    };
    this.onChange = this.onChange.bind(this);
    this.createTour = this.createTour.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createTourApi = this.createTourApi.bind(this);
  }

  componentDidMount() { document.title = 'Music Dashboard | Web Jam LLC'; }

  onChange(evt) {
    evt.preventDefault();
    this.setState({ [evt.target.id]: evt.target.value });
  }

  validateForm() {
    const {
      date, time, location, venue,
    } = this.state;
    if (date && time && location && venue && date !== '') return false;
    return true;
  }

  createTourApi(tour1) { // eslint-disable-line class-methods-use-this
    const { scc, auth } = this.props;
    const tour = tour1;
    tour.datetime = new Date(tour.date);
    const m = moment(tour.date, 'YYYY-MM-DD');
    tour.date = m.format('ll');
    scc.emit('newTour', { tour, token: auth.token });
    this.setState({ redirect: true });
  }

  createTour() {
    const {
      date, time, location, venue, tickets, more,
    } = this.state;
    const tour = {
      date, time, location, venue, tickets, more,
    };
    return this.createTourApi(tour);
  }

  render() {
    const {
      date, time, buttonStyle, redirect,
    } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/music" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Music Dashboard</h3>
        <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Create a New Tour</h5>
        <form style={{ marginTop: '4px', paddingLeft: '10px' }}>
          <label htmlFor="date" style={{ marginTop: 0, paddingTop: 0 }}>
            * Date
            <br />
            <input
              id="date"
              type="date"
              name="date"
              onChange={this.onChange}
              value={date}
              required
            />
          </label>
          <label htmlFor="time" style={{ marginTop: '14px', paddingTop: 0 }}>
            * Time
            <br />
            <input
              id="time"
              type="text"
              name="time"
              onChange={this.onChange}
              value={time}
              required
            />
          </label>
          <label htmlFor="time" style={{ marginTop: '14px', paddingTop: 0 }}>
            * Location
            <br />
            <input
              id="location"
              type="text"
              name="location"
              onChange={this.onChange}
              required
            />
          </label>
          <label htmlFor="time" style={{ marginTop: '14px', paddingTop: 0 }}>
            * Venue
            <br />
            <input
              id="venue"
              type="text"
              name="venue"
              onChange={(evt) => { this.setState({ venue: evt.target.value }); }}
              required
            />
          </label>
          <label htmlFor="time" style={{ marginTop: '14px', paddingTop: 0 }}>
            Tickets
            <br />
            <input
              id="more"
              type="text"
              name="more"
              onChange={(evt) => { this.setState({ tickets: evt.target.value }); }}
              required
            />
          </label>
          <label htmlFor="time" style={{ marginTop: '14px', paddingTop: 0 }}>
            More Details
            <br />
            <input
              id="more"
              type="text"
              name="more"
              onChange={(evt) => { this.setState({ more: evt.target.value }); }}
              required
            />
          </label>
          <div style={{ textAlign: 'right', marginTop: '10px', maxWidth: '85%' }}>
            <span style={{ fontSize: '16px', marginRight: '38%', fontFamily: 'Habibi' }}><i>* Required</i></span>
            <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createTour}>Create Tour</button>
          </div>
        </form>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
MusicDashboard.propTypes = { scc: PropTypes.shape({ emit: PropTypes.func }), auth: PropTypes.shape({ token: PropTypes.string }).isRequired };
MusicDashboard.defaultProps = { scc: { emit: () => {} } };
export default withRouter(connect(mapStoreToProps)(MusicDashboard));
