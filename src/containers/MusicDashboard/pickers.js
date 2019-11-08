import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

class Application extends React.Component {
  render() {
    return (
      <div className="App">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker-inline"
            label="Date"
            value={this.selectedDate}
            onChange={this.handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
          <KeyboardTimePicker
            id="time-picker"
            label="Time"
            value={this.selectedDate}
            onChange={this.handleDateChange}
            KeyboardButtonProps={{ 'aria-label': 'change time' }}
          />
        </MuiPickersUtilsProvider>
      </div>
    );
  }
}

export default Application;
