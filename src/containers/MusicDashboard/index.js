import React, { Component } from 'react';
import moment from 'moment';
import { withRouter, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import mapStoreToProps from '../../redux/mapStoreToProps';
import forms from '../../lib/forms';
import commonUtils from '../../lib/commonUtils';

export class MusicDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      date: '',
      time: '',
      tickets: '',
      more: '',
      venue: '',
    };
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.createTour = this.createTour.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createTourApi = this.createTourApi.bind(this);
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Music Dashboard'); }

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
    return true;
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

  newTourForm(date, time, buttonStyle) {
    const {
      venue, location, tickets, more,
    } = this.state;
    return (
      <form id="new-tour" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.forms.makeInput('date', 'Date', true, this.onChange, date)}
        {this.forms.makeInput('text', 'Time', true, this.onChange, time)}
        {this.forms.makeInput('text', 'Venue', true, this.onChange, venue)}
        {this.forms.makeInput('text', 'Location', true, this.onChange, location)}
        {this.forms.makeInput('text', 'Tickets', false, this.onChange, tickets)}
        {this.forms.makeInput('text', 'More', false, this.onChange, more)}
        <div style={{ textAlign: 'right', marginTop: '10px', maxWidth: '85%' }}>
          <span style={{ fontSize: '16px', marginRight: '38%', fontFamily: 'Habibi' }}><i>* Required</i></span>
          <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createTour}>Create Tour</button>
        </div>
      </form>
    );
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
        {this.newTourForm(date, time, buttonStyle)}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
MusicDashboard.propTypes = {
  scc: PropTypes.shape({ emit: PropTypes.func }).isRequired,
  auth: PropTypes.shape({ token: PropTypes.string }).isRequired,
};
export default withRouter(connect(mapStoreToProps)(MusicDashboard));
