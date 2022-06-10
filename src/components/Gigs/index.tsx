import { useContext, useEffect, useState } from 'react';
import { DataGrid, GridColumns, GridEnrichedColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataContext, IGig } from '../../providers/Data.provider';
import HtmlReactParser from 'html-react-parser';
import { defaultGig } from 'src/providers/fetchGigs';
import './Gigs.scss';

export const makeVenueValue = (value: string) => {
  const parsed = HtmlReactParser(value);
  if (value === 'Our Past Performances') return <span className="ourPastPerformances">{parsed}</span>;
  return <span>{parsed}</span>;
};

export const makeVenue = (): GridEnrichedColDef => {
  return (
    {
      field: 'venue',
      headerName: 'Venue',
      width: 600,
      editable: false,
      renderCell: (params: GridRenderCellParams) => makeVenueValue(params.value),
    }
  );
};

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

export const orderGigs = (gigs: IGig[], setGigsInOrder: { (arg0: IGig[]): void; }) => {
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
  sortedFuture.push({ ...defaultGig, venue: 'Our Past Performances', id: 999, tickets: ' ' });
  setGigsInOrder(sortedFuture.concat(pastGigs));
};

export const Gigs = ({ isAdmin }: { isAdmin: boolean }): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const { gigs } = useContext(DataContext);
  const [gigsInOrder, setGigsInOrder] = useState(gigs);
  useEffect(() => orderGigs(gigs, setGigsInOrder), [gigs]);
  return (
    <div style={{ margin: 'auto', padding: '10px', width: '100%' }}>
      <h4 style={{ textAlign: 'center' }}>
        Gigs
        {isAdmin ? <Tooltip title="Add New Gig" placement="right">
          <IconButton sx={{ marginLeft: '10px', color: 'blue' }} onClick={() => {
            console.log('show dialog');
            setShowDialog(true);
          }}>
            <AddIcon />
          </IconButton></Tooltip> : ''}
      </h4>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={gigsInOrder}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </div>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Create New Gig</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter all required fields to create a new gig.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="tickets"
            label="Tickets"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setShowDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={()=>console.log('run create call')}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

