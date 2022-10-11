import { useContext, useEffect, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  DataGrid, GridColumns, GridEnrichedColDef, GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import { DataContext, IGig } from 'src/providers/Data.provider';
import HtmlReactParser from 'html-react-parser';
import { defaultGig } from 'src/providers/fetchGigs';
import './Gigs.scss';

// eslint-disable-next-line max-len
const usStateOptions = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

export const makeVenueValue = (value: string) => {
  const parsed = HtmlReactParser(value);
  if (value === 'Our Past Performances') return <span className="ourPastPerformances">{parsed}</span>;
  return <span>{parsed}</span>;
};

export const makeVenue = (): GridEnrichedColDef => (
  {
    field: 'venue',
    headerName: 'Venue',
    width: 600,
    editable: false,
    renderCell: (params: GridRenderCellParams) => makeVenueValue(params.value),
  }
);

export const columns: GridColumns = [
  {
    field: 'date',
    headerName: 'Date',
    width: 150,
    editable: false,
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 150,
    editable: false,
  },
  {
    field: 'location',
    headerName: 'Location',
    minWidth: 150,
    flex: 1,
    editable: false,
  },
  makeVenue(),
  {
    field: 'tickets',
    headerName: 'Tickets',
    width: 140,
    editable: false,
    renderCell: (params: GridRenderCellParams) => <span>{HtmlReactParser(params.value || 'Free')}</span>,
  },
];

export const orderGigs = (gigs: IGig[], setGigsInOrder: { (arg0: IGig[]): void; }, setPageSize: (arg0: number) => void) => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const current = now.toISOString();
  const futureGigs = gigs.filter((g) => typeof g.datetime === 'string' && g.datetime >= current);
  const pastGigs = gigs.filter((g) => typeof g.datetime === 'string' && g.datetime < current);
  const sortedFuture = futureGigs.sort((a, b) => {
    if (a.datetime > b.datetime) return 1;
    if (a.datetime < b.datetime) return -1;
    return 0;
  });
  sortedFuture.push({
    ...defaultGig, venue: 'Our Past Performances', id: 999, tickets: ' ',
  });
  setGigsInOrder(sortedFuture.concat(pastGigs));
  setPageSize(futureGigs.length - 1 > 5 ? futureGigs.length - 1 : 5);
};

export const createGig = async (dateTime: Date | null, venue:string, city:string, usState:string, tickets:string) => {
  console.log('createGig');
};

export function Gigs({ isAdmin }: { isAdmin: boolean }): JSX.Element {
  const [showDialog, setShowDialog] = useState(false);
  const { gigs } = useContext(DataContext);
  const [gigsInOrder, setGigsInOrder] = useState(gigs);
  const now = new Date() as Date | null;
  const [dateTime, setDateTime] = useState(now);
  const [pageSize, setPageSize] = useState(5);
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [usState, setUSstate] = useState('');
  const [tickets, setTickets] = useState('');
  useEffect(() => orderGigs(gigs, setGigsInOrder, setPageSize), [gigs]);
  const checkDisabled = () => {
    let isDisabled = true;
    if (city && usState && dateTime && venue) isDisabled = false;
    return isDisabled;
  };
  return (
    <div className="gigsDiv" style={{ margin: 'auto', padding: '10px', width: '100%' }}>
      <h4 style={{ textAlign: 'center' }}>
        Gigs
        {isAdmin ? (
          <Tooltip title="Add New Gig" placement="right">
            <IconButton
              className="showCreateDialog"
              sx={{ marginLeft: '10px', color: 'blue' }}
              onClick={() => {
                setShowDialog(true);
                return true;
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        ) : ''}
      </h4>
      <div style={{ height: '500px', width: '100%' }}>
        <DataGrid
          rows={gigsInOrder}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[pageSize]}
          disableSelectionOnClick
        />
      </div>
      <Dialog
        className="createNewGigDialog"
        open={showDialog}
        onClose={() => { setShowDialog(false); return false; }}
      >
        <DialogTitle>Create New Gig</DialogTitle>
        <DialogContent sx={{ padding: '10px 10px' }}>
          <DialogContentText sx={{ marginBottom: '30px' }}>
            Enter all *required fields to create a new gig.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="* Date and Time"
              value={dateTime}
              onChange={(newValue: Date | null) => { setDateTime(newValue); return newValue; }}
              renderInput={(params) => <TextField className="dateTimeInput" {...params} />}
            />
          </LocalizationProvider>
          <p style={{ fontSize: '9pt', marginBottom: '0px' }}>* Venue</p>
          <Editor
            value={venue}
            apiKey={process.env.TINY_KEY}
            init={{
              height: 500,
              menubar: 'insert tools',
              menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount',
              ],
              toolbar:
            'undo redo | formatselect | bold italic backcolor forecolor |'
            + 'alignleft aligncenter alignright alignjustify |'
            + 'bullist numlist outdent indent | removeformat | help',
            }}
            onEditorChange={(evt) => setVenue(evt)}
          />
          <TextField
            autoFocus
            margin="normal"
            id="city"
            label="* City"
            type="text"
            fullWidth
            variant="standard"
            onChange={(evt) => setCity(evt.target.value)}
          />
          <FormControl fullWidth sx={{ marginTop: '20px' }}>
            <InputLabel id="select-us-state-label">* State</InputLabel>
            <Select
              labelId="select-us-state-label"
              id="select-us-state"
              value={usState || 'Virginia'}
              label="* State"
              onChange={(evt) => setUSstate(evt.target.value)}
            >
              {usStateOptions.map((s:string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="tickets"
            label="Tickets"
            type="text"
            fullWidth
            variant="standard"
            onChange={(evt) => setTickets(evt.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            className="cancelButton"
            onClick={() => { setShowDialog(false); return false; }}
          >
            Cancel
          </Button>
          <Button
            disabled={checkDisabled()}
            size="small"
            variant="contained"
            onClick={() => createGig(dateTime, venue, city, usState, tickets)}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

