import {
  useContext, useEffect, useState,
} from 'react';
import {
  DataGrid, GridColumns, GridRenderCellParams,
} from '@mui/x-data-grid';
import { IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HtmlReactParser from 'html-react-parser';
import { DataContext, Igig } from 'src/providers/Data.provider';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import utils from './gigs.utils';
import { EditGigDialog } from './EditGigDialog';
import { CreateGigDialog } from './CreateGigDialog';
import './gigs.scss';

export const columns: GridColumns = [
  {
    field: 'date',
    headerName: 'Date',
    width: 220,
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
    width: 90,
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

export const ShowCreateGigButton = (
  { isAdmin, setShowDialog }: { isAdmin: boolean, setShowDialog: (arg0: boolean) => void },
) => {
  if (!isAdmin) return null;
  return (
    <Tooltip title="Add New Gig" placement="right">
      <IconButton
        className="showCreateDialog"
        sx={{ marginLeft: '10px', color: 'blue' }}
        onClick={() => setShowDialog(true)}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
};

interface IgigsDivProps {
  isAdmin: boolean, showDialog: boolean, setShowDialog: (arg0: boolean) => void,
  gigsInOrder: Igig[] | null, pageSize: number, editGig: Igig, setEditGig: (arg0: Igig) => void,
  editChanged: boolean, setEditChanged: (arg0: boolean) => void, getGigs: () => boolean, auth: Iauth
}
export const GigsDiv = (props: IgigsDivProps) => {
  const {
    isAdmin, setShowDialog, setEditGig, editGig, gigsInOrder = [], pageSize, showDialog, editChanged, setEditChanged, getGigs, auth,
  } = props;
  return (
    <div
      className="gigsDiv"
      style={{
        margin: 'auto', padding: '10px', width: '100%',
      }}
    >
      <h4 style={{ textAlign: 'center' }}>
        Gigs
        <ShowCreateGigButton isAdmin={isAdmin} setShowDialog={setShowDialog} />
      </h4>
      <div style={{ height: '500px', width: '100%' }}>
        <DataGrid
          className={isAdmin ? 'adminGrid' : ''}
          onRowClick={(rowParams) => {
            utils.clickToEdit(setEditGig, isAdmin, rowParams.row);
          }}
          rows={gigsInOrder || []}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[pageSize]}
          disableSelectionOnClick
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

export function Gigs({ isAdmin }: { isAdmin: boolean }): JSX.Element {
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
    showDialog,
    editGig,
    setEditChanged,
    editChanged,
    getGigs,
    auth,
  };
  return <GigsDiv {...props} />;
}

