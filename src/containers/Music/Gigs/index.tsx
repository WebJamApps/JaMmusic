import {
  useContext, useEffect, useState,
} from 'react';
import {
  DataGrid, type GridColDef, type GridRenderCellParams,
} from '@mui/x-data-grid';
import { Button, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HtmlReactParser from 'html-react-parser';
import { DataContext, Igig } from 'src/providers/Data.provider';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import { useNavigate } from 'react-router-dom';
import utils from './gigs.utils';
import { EditGigDialog } from './EditGigDialog';
import { CreateGigDialog } from './CreateGigDialog';
import './gigs.scss';

export const makeColumns = (isMobile = false): GridColDef[] => {
  const dateCol: GridColDef = {
    field: 'date',
    headerName: 'Date',
    width: isMobile ? 110 : 220,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime, usState } } = params;
      if (!datetime) return '';
      return isMobile ? utils.makeShortDateValue(datetime, usState) : utils.makeDateValue(datetime, usState);
    },
  };
  const timeCol: GridColDef = {
    field: 'time',
    headerName: 'Time',
    width: isMobile ? 140 : 170,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime, duration, usState } } = params;
      if (!datetime) return '';
      return utils.makeTimeRange(datetime, duration, usState);
    },
  };
  const locationCol: GridColDef = {
    field: 'location',
    headerName: 'Location',
    width: isMobile ? 150 : undefined,
    minWidth: isMobile ? undefined : 160,
    flex: isMobile ? 0 : 1,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { location, city, usState } } = params;
      if (location) return location;
      if (city) return `${city}, ${usState}`;
      return '';
    },
  };
  const ticketsCol: GridColDef = {
    field: 'tickets',
    headerName: 'Tickets',
    width: 120,
    editable: false,
    renderCell: (params: GridRenderCellParams) => <span>{HtmlReactParser(params.value || 'Free')}</span>,
  };
  const photoCol: GridColDef = {
    field: 'promoImageUrl',
    headerName: 'Photo',
    width: 90,
    sortable: false,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { promoImageUrl } } = params;
      if (!promoImageUrl) return '';
      // Static thumbnail; the onClick only stops the click bubbling so it never
      // opens the row's edit dialog (the thumbnail itself does nothing).
      return (
        // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions
        <img
          src={promoImageUrl}
          alt="gig promo"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
  };
  // Apply the requested column order for both mobile and desktop (photo far right).
  return [dateCol, timeCol, utils.makeVenue(isMobile), locationCol, ticketsCol, photoCol];
};

// Backwards-compatible default (desktop) export.
export const columns: GridColDef[] = makeColumns(false);

export const ShowCreateGigButton = (
  { isAdmin, setShowDialog }: { isAdmin: boolean, setShowDialog: (arg0: boolean) => void },
) => {
  if (!isAdmin) return null;
  return (
    <Tooltip title="Add New Gig" placement="right">
      <IconButton
        className="showCreateDialog"
        sx={{ marginLeft: '10px', color: 'blue' }}
        onClick={(e) => { e.currentTarget.blur(); setShowDialog(true); }}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
};

interface IgigsDivProps {
  isAdmin: boolean, showDialog: boolean, setShowDialog: (arg0: boolean) => void,
  gigsInOrder: Igig[] | null, pageSize: number, editGig: Igig, setEditGig: (arg0: Igig) => void,
  editChanged: boolean, setEditChanged: (arg0: boolean) => void, getGigs: () => boolean, auth: Iauth,
  setPageSize: (arg0: number) => void
}
export const GigsDiv = (props: IgigsDivProps) => {
  const {
    isAdmin, setShowDialog, setEditGig, editGig, gigsInOrder = [], pageSize, showDialog, editChanged, setEditChanged, getGigs, auth, setPageSize,
  } = props;
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(0);
  const handleClick = () => {
    if (process.env.APP_NAME === 'joshandmariamusic.com') window.open('https://web-jam.com/music/bookus');
    else navigate('/music/bookus');
  };
  return (
    <div
      className="gigsDiv"
      style={{
        margin: 'auto', padding: '10px 16px', width: '100%',
      }}
    >
      <h4 style={{ textAlign: 'center' }}>
        Gigs
        <Button variant="contained" className="bookUsButton" onClick={handleClick}>Book Us</Button>
        <ShowCreateGigButton isAdmin={isAdmin} setShowDialog={setShowDialog} />
      </h4>
      <div style={{ height: '500px', width: '100%' }}>
        <DataGrid
          className={isAdmin ? 'adminGrid' : ''}
          getRowHeight={() => 'auto'}
          onRowClick={(rowParams) => {
            utils.clickToEdit(setEditGig, isAdmin, rowParams.row);
          }}
          rows={gigsInOrder || []}
          columns={makeColumns(isMobile)}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => { setPage(model.page); setPageSize(model.pageSize); }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
        />
      </div>
      <CreateGigDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      <EditGigDialog
        editGig={editGig}
        setEditGig={setEditGig}
        setShowDialog={setShowDialog}
        setEditChanged={setEditChanged}
        editChanged={editChanged}
        getGigs={getGigs}
        auth={auth}
      />
    </div>
  );
};

export function Gigs({ isAdmin }: { isAdmin: boolean }) {
  const { auth } = useContext(AuthContext);
  const { gigs, getGigs } = useContext(DataContext);
  const [showDialog, setShowDialog] = useState(false);
  const [gigsInOrder, setGigsInOrder] = useState(gigs);
  const [pageSize, setPageSize] = useState(5);
  const [editGig, setEditGig] = useState(defaultGig);
  const [editChanged, setEditChanged] = useState(false);
  useEffect(() => { utils.orderGigs(gigs, setGigsInOrder, setPageSize); }, [gigs]);
  const props = {
    isAdmin,
    setShowDialog,
    setEditGig,
    gigsInOrder,
    pageSize,
    setPageSize,
    showDialog,
    editGig,
    setEditChanged,
    editChanged,
    getGigs,
    auth,
  };
  return <GigsDiv {...props} />;
}
