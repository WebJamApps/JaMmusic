import React, { Component } from 'react';
import forms from '../lib/forms';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      comments: '',
      uSAstate: '',
      country: 'Afghanistan',
      zipcode: '',
      phonenumber: '',
      emailaddress: '',
      fullname: '',
    };
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    // this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues = ['--', 'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    this.stateValues.sort();
    this.countryValues = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua & Deps', 'Argentina', 'Armenia', 'Australia', 'Austria',
      'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
      'Benin', 'Bhutan', 'Bolivia', 'Bosnia Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina', 'Burundi', 'Cambodia', 'Cameroon',
      'Canada', 'Cape Verde', 'Central African Rep', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
      'Congo (Democratic Rep)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
      'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia',
      'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
      'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland (Republic)', 'Israel', 'Italy',
      'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
      'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
      'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
      'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar, (Burma)',
      'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan',
      'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
      'Qatar', 'Romania', 'Russian Federation', 'Rwanda', 'St Kitts & Nevis', 'St Lucia', 'Saint Vincent & the Grenadines', 'Samoa', 'San Marino',
      'Sao Tome & Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
      'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland',
      'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
      'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
      'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
      'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
    this.countryValues.sort();
  }

  onChange(evt, isSelect) {
    evt.preventDefault();
    if (isSelect) return this.setState({ uSAstate: evt.target.value });
    return this.setState({ [evt.target.id]: evt.target.value });
  }

  handleChange(event, isSelect) {
    if (isSelect) return this.setState({ country: event.target.value });
    return this.setState({ comments: event.target.value });
  }

  validateForm() {
    const {
      fullname, emailaddress, comments, zipcode,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    // const phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (regEx.test(emailaddress) && emailaddress.includes('.')) {
      validEmail = true;
    }
    // if (phoneno.test(phonenumber)) {
    //   validPhoneNumber = true;
    // }
    // if (phonenumber !== '' && !validPhoneNumber) return true;
    if (fullname && emailaddress && zipcode && comments !== '' && validEmail) return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ submitted: true });
    return true;
  }

  createEmail() {
    const {
      fullname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
    } = this.state;
    const emailForm = {
      fullname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
    };
    return this.createEmailApi(emailForm);
  }

  countryDropdown(country) {
    return (
      <label htmlFor="country">
          * Country
        <br />
        <select value={country} onChange={(event) => this.handleChange(event, true)}>
          {
            this.countryValues.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
          }
        </select>
      </label>
    );
  }

  statesDropdown(uSAstate) {
    return (
      <label htmlFor="state">
          State
        <br />
        <select value={uSAstate} onChange={(evt) => this.onChange(evt, true)}>
          {
            this.stateValues.map((sv) => <option id={sv} key={sv} value={sv}>{sv}</option>)
          }
        </select>
      </label>
    );
  }

  newContactForm(fullname, country, emailaddress, phonenumber, zipcode, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.forms.makeInput('text', 'Full Name', true, this.onChange, fullname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onChange, emailaddress)}
        { this.forms.makeInput('zip', 'Zipcode', true, this.onChange, zipcode)}
        { this.forms.makeInput('tel', 'Phone Number', false, this.onChange, phonenumber)}
        { this.countryDropdown() }
        { country.state === 'United States'
          ? (
            this.statesDropdown()
          )
          : null}
        <label htmlFor="comments">
          * Comments
          <br />
          <textarea style={{ minWidth: '3in', paddingLeft: '5px' }} value={comments} onChange={this.handleChange} />
        </label>
        <div className="inquiryValidation">
          <span className="inquiryValidation">* Required</span>
          <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createEmail}>Send</button>
        </div>
      </form>
    );
  }

  render() {
    const {
      submitted, fullname, emailaddress, comments, phonenumber, zipcode, buttonStyle,
    } = this.state;
    return (
      <div>
        { submitted === false ? (
          <div className="page-content">
            <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
            {this.newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle)}
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
          </div>
        ) : (
          <div className="page-content contacted">
            <p style={{ textAlign: 'center', margin: '14px', paddingBottom: '15px' }}>
              Thank you for contacting us.
              <br />
              We will be in contact with you shortly.
            </p>
          </div>
        )}
      </div>
    );
  }
}
