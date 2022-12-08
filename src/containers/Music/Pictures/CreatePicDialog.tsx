import {
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
// import { useContext } from 'react';
// import { AuthContext } from 'src/providers/Auth.provider';
// import { DataContext } from 'src/providers/Data.provider';

interface IcreatePicDialogProps {
  showDialog: boolean, setShowDialog: (arg0: boolean) => void,
}
export function CreatePicDialog({ showDialog, setShowDialog }: IcreatePicDialogProps) {
  // const { auth } = useContext(AuthContext);
  //   const { getGigs } = useContext(DataContext);
  //   const now = new Date() as Date | null;
  //   const [dateTime, setDateTime] = useState(now);
  //   const [venue, setVenue] = useState('');
  //   const [city, setCity] = useState('');
  //   const [usState, setUSstate] = useState('Virginia');
  //   const [tickets, setTickets] = useState('');
  return (
    <Dialog
      disableEnforceFocus
      disableAutoFocus
      className="createNewGigDialog"
      open={showDialog}
      onClose={() => setShowDialog(false)}
    >
      <DialogTitle>Create New Picture</DialogTitle>
      <DialogContent sx={{ padding: '10px 10px' }}>
        <DialogContentText sx={{ marginBottom: '30px' }}>
          Enter all *required fields to create a new picture.
        </DialogContentText>
        <p className="venueLabel">* Venue</p>
        {/* <TextField
          sx={{ marginTop: '20px' }}
          label="* City"
          type="text"
          fullWidth
          value={city}
          onChange={(evt) => { setCity(evt.target.value); return evt.target.value; }}
        /> */}
        {/* <TextField
          sx={{ marginTop: '20px' }}
          label="Tickets"
          type="text"
          fullWidth
          value={tickets}
          onChange={(evt) => { setTickets(evt.target.value); return evt.target.value; }}
        /> */}
      </DialogContent>
      <DialogActions>
        <Button
          // disabled={utils.checkNewDisabled(city, usState, dateTime, venue)}
          size="small"
          variant="contained"
          className="createPicButton"
          // onClick={() => { utils.createGig(getGigs, setShowDialog, dateTime, venue, city, usState, tickets, auth); }}
        >
          Create
        </Button>
        <Button
          size="small"
          className="cancelPicButton"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
