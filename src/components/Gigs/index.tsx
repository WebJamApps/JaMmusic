import { useContext, useEffect, useState } from 'react';
import { DataGrid, GridColumns, GridEnrichedColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DataContext, IGig } from '../../providers/Data.provider';
import HtmlReactParser from 'html-react-parser';
import { defaultGig } from 'src/providers/fetchGigs';
import './Gigs.scss';

export const makeVenueValue = (value:string) =>{
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
    width: 150,
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
  const now = new Date().toISOString();
  const futureGigs = gigs.filter((g) => typeof g.datetime === 'string' && g.datetime >= now);
  const pastGigs = gigs.filter((g) => typeof g.datetime === 'string' && g.datetime < now);
  const sortedFuture = futureGigs.sort((a, b) => {
    if (a.datetime > b.datetime) return 1;
    if (a.datetime < b.datetime) return -1;
    return 0;
  });
  sortedFuture.push({ ...defaultGig, venue: 'Our Past Performances', id:999, tickets:' ' });
  console.log(futureGigs);
  setGigsInOrder(sortedFuture.concat(pastGigs));
};

export const Gigs = (): JSX.Element => {
  const { gigs } = useContext(DataContext);
  const [gigsInOrder, setGigsInOrder] = useState(gigs);
  useEffect(() => orderGigs(gigs, setGigsInOrder), [gigs]);
  return (
    <div style={{ margin: 'auto', padding: '10px', width: '100%' }}>
      <h4 style={{ textAlign: 'center' }}>Gigs</h4>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={gigsInOrder}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

