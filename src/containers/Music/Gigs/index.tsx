import {
  useContext, useEffect, useState,
} from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  DataGrid, GridColumns, GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import HtmlReactParser from 'html-react-parser';
import { DataContext } from 'src/providers/Data.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import utils from './gigs.utils';
import { CreateGigDialog, usStateOptions } from './CreateGigDialog';
import './gigs.scss';

let tinyCount = 0;

export const columns: GridColumns = [
  {
    field: 'date',
    headerName: 'Date',
    width: 100,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime } } = params;
      if (!datetime) return '';
      return utils.makeDateValue(datetime);
    },
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 110,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime } } = params;
      if (!datetime) return '';
      return utils.makeTimeValue(datetime);
    },
  },
  {
    field: 'location',
    headerName: 'Location',
    minWidth: 160,
    flex: 1,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { location, city, usState } } = params;
      if (location) return location;
      if (city) return `${city}, ${usState}`;
      return '';
    },
  },
  utils.makeVenue(),
  {
    field: 'tickets',
    headerName: 'Tickets',
    width: 120,
    editable: false,
    renderCell: (params: GridRenderCellParams) => <span>{HtmlReactParser(params.value || 'Free')}</span>,
  },
];

interface IeditTextProps {
  objKey: 'city' | 'tickets',
  editGig: typeof defaultGig,
  setEditChanged: (arg0: boolean) => void,
  setEditGig: (arg0: typeof defaultGig) => void,
  required: boolean
}
export const EditText = (props: IeditTextProps) => {
  const {
    objKey, editGig, setEditChanged, setEditGig, required,
  } = props;
  let label = required ? '* ' : '';
  label = label + objKey.charAt(0).toUpperCase() + objKey.slice(1);
  return (
    <TextField
      label={label}
      type="text"
      fullWidth
      sx={{ marginTop: '20px' }}
      // eslint-disable-next-line security/detect-object-injection
      value={editGig[objKey]}
      onChange={(evt) => {
        setEditChanged(true);
        setEditGig({ ...editGig, [objKey]: evt.target.value });
      }}
    />
  );
};

interface IvenueEditorProps {
  editGig: typeof defaultGig, setEditChanged: (arg0: boolean) => void,
  setEditGig: (arg0: typeof defaultGig) => void
}
export const VenueEditor = ({ editGig, setEditChanged, setEditGig }: IvenueEditorProps) => {
  if (!editGig._id) return null;
  return (
    <Editor
      id="edit-venue"
      value={editGig.venue}
      apiKey={process.env.TINY_KEY}
      init={{
        height: 500,
        menubar: 'insert tools',
        menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor forecolor |'
          + 'alignleft aligncenter alignright alignjustify |'
          + 'bullist numlist outdent indent | removeformat | help',
      }}
      onEditorChange={(text: string) => {
        tinyCount += 1;
        if (text !== editGig.venue && tinyCount > 1) {
          setEditChanged(true);
          setEditGig({ ...editGig, venue: text }); return text;
        }
        return '';
      }}
    />
  );
};

export function Gigs({ isAdmin }: { isAdmin: boolean }): JSX.Element {
  const [showDialog, setShowDialog] = useState(false);
  const { gigs, getGigs } = useContext(DataContext);
  const [gigsInOrder, setGigsInOrder] = useState(gigs);
  const [pageSize, setPageSize] = useState(5);
  const [editGig, setEditGig] = useState(defaultGig);
  const [editChanged, setEditChanged] = useState(false);
  useEffect(() => { utils.orderGigs(gigs, setGigsInOrder, setPageSize); }, [gigs]);
  return (
    <div
      className="gigsDiv"
      style={{
        margin: 'auto', padding: '10px', width: '100%', maxWidth: '1040px',
      }}
    >
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
          className={isAdmin ? 'adminGrid' : ''}
          onRowClick={(rowParams) => {
            tinyCount = 0;
            utils.clickToEdit(setEditGig, isAdmin, rowParams.row);
          }}
          rows={gigsInOrder}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[pageSize]}
          disableSelectionOnClick
        />
      </div>
      <CreateGigDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      <Dialog
        disableEnforceFocus
        disableAutoFocus
        className="editGigDialog"
        open={!!editGig._id}
        onClose={() => { setShowDialog(false); return false; }}
      >
        <DialogTitle>Edit Gig</DialogTitle>
        <DialogContent sx={{ padding: '10px 10px' }}>
          <DialogContentText sx={{ marginBottom: '30px' }}>
            Enter all *required.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              className="editDateTime"
              label="* Date and Time"
              value={editGig.datetime}
              onChange={(newValue: Date | null) => {
                setEditChanged(true);
                setEditGig({ ...editGig, datetime: newValue }); return newValue;
              }}
              renderInput={(params) => <TextField className="dateTimeInput" {...params} />}
            />
          </LocalizationProvider>
          <p className="venueLabel">* Venue</p>
          <VenueEditor editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} />
          <EditText objKey="city" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required />
          <FormControl fullWidth sx={{ marginTop: '20px' }}>
            <InputLabel id="edit-us-state-label">* State</InputLabel>
            <Select
              labelId="edit-us-state-label"
              id="edit-us-state"
              value={editGig.usState}
              label="* State"
              onChange={(evt) => {
                setEditChanged(true);
                setEditGig({ ...editGig, usState: evt.target.value }); return evt.target.value;
              }}
            >
              {usStateOptions.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <EditText objKey="tickets" editGig={editGig} setEditChanged={setEditChanged} setEditGig={setEditGig} required={false} />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={utils.checkUpdateDisabled(editGig, editChanged)}
            size="small"
            variant="contained"
            className="updateGigButton"
            onClick={() => {
              tinyCount = 0;
              utils.updateGig(getGigs, setEditGig, setEditChanged, editGig);
            }}
          >
            Update
          </Button>
          <Button
            size="small"
            className="deleteGigButton"
            sx={{ color: 'red' }}
            onClick={() => {
              setEditChanged(false);
              tinyCount = 0;
              utils.deleteGig(editGig._id || '', getGigs, setEditGig, setEditChanged);
            }}
          >
            Delete
          </Button>
          <Button
            size="small"
            className="cancelEditGigButton"
            onClick={() => {
              setEditChanged(false);
              tinyCount = 0;
              setEditGig(defaultGig);
              return false;
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

