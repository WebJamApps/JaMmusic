import React, { Component, useState } from 'react';
import moment from 'moment';
import { withRouter, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateFnsUtils from "@date-io/date-fns";
import {
  DatePicker,
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
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
      selectedDate: new Date()
    };
    this.onChange = this.onChange.bind(this);
    this.createTour = this.createTour.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createTourApi = this.createTourApi.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this)
  }

  componentDidMount() { document.title = 'Music Dashboard | Web Jam LLC'; }

  handleDateChange(e) {
    this.setState({ selectedDate: e })
    console.log(e)
  }
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

  makeInput(type, name, isRequired, onChange, value) { // eslint-disable-line class-methods-use-this
    return (
      <label htmlFor={name} style={{ marginTop: '14px', paddingTop: 0 }}>
        {isRequired ? '* ' : ''}
        {name[0].toUpperCase() + name.slice(1)}
        <br />
        <input id={name} type={type} name={name} onChange={onChange} required={isRequired} value={value} />
      </label>
    );
  }

  newTourForm(date, time, buttonStyle) {
    const {
      venue, location, tickets, more,
    } = this.state;
    return (
      <form id="new-tour" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.makeInput('date', 'date', true, this.onChange, date)}
        {this.makeInput('text', 'time', true, this.onChange, time)}
        {this.makeInput('text', 'venue', true, this.onChange, venue)}
        {this.makeInput('text', 'location', true, this.onChange, location)}
        {this.makeInput('text', 'tickets', false, this.onChange, tickets)}
        {this.makeInput('text', 'more', false, this.onChange, more)}
        <div  className = "divStyle">
          <MuiPickersUtilsProvider utils={DateFnsUtils} >
            <KeyboardTimePicker
              id="time-picker"
              label="Time picker"
              value={this.selectedDate}
              onChange={this.handleDateChange}
              KeyboardButtonProps={{ 'aria-label': 'change time' }}
            />
          </MuiPickersUtilsProvider>
        </div>
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
      <div className="page-content" >
        {redirect ? <Redirect to="/music" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Music Dashboard</h3>
        <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Create a New Tour</h5>
        {this.newTourForm(date, time, buttonStyle)}
      </div>
    );
  }
}
MusicDashboard.propTypes = { scc: PropTypes.shape({ emit: PropTypes.func }), auth: PropTypes.shape({ token: PropTypes.string }).isRequired };
MusicDashboard.defaultProps = { scc: { emit: () => { } } };
export default withRouter(connect(mapStoreToProps)(MusicDashboard));
