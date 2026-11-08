import {
  useContext, useEffect, useState,
} from 'react';
import {
  DataGrid, type GridColDef, type GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Button, IconButton, TablePagination, Tooltip, useMediaQuery,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HtmlReactParser from 'html-react-parser';
import { DataContext, Igig } from 'src/providers/Data.provider';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import { useNavigate } from 'react-router';
import utils from './gigs.utils';
import { EditGigDialog } from './EditGigDialog';
import { CreateGigDialog } from './CreateGigDialog';
import { AnnounceGigDialog } from './AnnounceGigDialog';
import './gigs.scss';

export const makeColumns = (
  isMobile = false,
  isAdmin = false,
  onAnnounce?: (gig: Igig) => void,
): GridColDef[] => {
  const dateCol: GridColDef = {
    field: 'date',
    headerName: 'Date',
    width: 120,
    minWidth: 120,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime, usState, venueId } } = params;
      if (!datetime) return '';
      const resolvedState = venueId && typeof venueId === 'object' ? venueId.usState : usState;
      return utils.makeDateValue(datetime, resolvedState);
    },
  };
  const timeCol: GridColDef = {
    field: 'time',
    headerName: 'Time',
    width: 120,
    minWidth: 120,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { datetime, duration, usState, venueId } } = params;
      if (!datetime) return '';
      const resolvedState = venueId && typeof venueId === 'object' ? venueId.usState : usState;
      return utils.makeTimeRange(datetime, duration, resolvedState);
    },
  };
  const locationCol: GridColDef = {
    field: 'location',
    headerName: 'Location',
    minWidth: 160,
    flex: 1,
    editable: false,
    renderCell: (params: GridRenderCellParams) => utils.renderLocation(params.row),
  };
  const ticketsCol: GridColDef = {
    field: 'tickets',
    headerName: 'Tickets',
    width: 100,
    minWidth: 100,
    editable: false,
    renderCell: (params: GridRenderCellParams) => <span>{HtmlReactParser(params.value || 'Free')}</span>,
  };
  const photoCol: GridColDef = {
    field: 'promoImageUrl',
    headerName: 'Photo',
    width: 80,
    minWidth: 80,
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
  const announceCol: GridColDef = {
    field: 'announce',
    headerName: 'Announce',
    width: 150,
    minWidth: 150,
    sortable: false,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params;
      if (!isAdmin || !utils.isUpcomingGig(row)) return '';
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="small"
            variant="outlined"
            className="announceButton"
            onClick={(e) => {
              e.stopPropagation();
              onAnnounce?.(row);
            }}
          >
            Announce
          </Button>
          {Boolean(row.announcedAt) && (
            <span
              className="announcedBadge"
              style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}
            >
              announced ✓
            </span>
          )}
        </div>
      );
    },
  };

  const baseColumns = [dateCol, timeCol, utils.makeVenue(isMobile), locationCol, ticketsCol, photoCol];
  if (isAdmin) return [announceCol, ...baseColumns];
  return baseColumns;
};

// Backwards-compatible default (desktop) export.
export const columns: GridColDef[] = makeColumns(false);

export const GigCard = ({
  gig,
  isAdmin,
  onAnnounce,
  onEdit,
}: {
  gig: Igig;
  isAdmin: boolean;
  onAnnounce?: (gig: Igig) => void;
  onEdit?: (gig: Igig) => void;
}) => {
  if (gig.venue === 'Our Past Performances' || gig.id === 999) {
    return (
      <div className="ourPastPerformances gig-card-separator">
        {HtmlReactParser(gig.venue || 'Our Past Performances')}
      </div>
    );
  }
  const isNudge = isAdmin && utils.isUpcomingGig(gig) && utils.isWithin10Days(gig.datetime);
  const resolvedState = gig.venueId && typeof gig.venueId === 'object' ? gig.venueId.usState : gig.usState;
  const dateStr = gig.datetime ? utils.makeDateValue(gig.datetime, resolvedState) : '';
  const timeStr = gig.datetime ? utils.makeTimeRange(gig.datetime, gig.duration, resolvedState) : '';
  const dateTimeStr = timeStr ? `${dateStr}, ${timeStr}` : dateStr;

  return (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions
    <div
      className={`gig-card ${isNudge ? 'gig-announce-nudge' : ''}`}
      data-testid={`gig-card-${gig._id || gig.id || 'item'}`}
      style={{ cursor: isAdmin ? 'pointer' : 'default' }}
      onClick={() => {
        if (isAdmin) onEdit?.(gig);
      }}
      onKeyDown={(e) => {
        if (isAdmin && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit?.(gig);
        }
      }}
    >
      {isAdmin && utils.isUpcomingGig(gig) && (
        <div className="gig-card-announce" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Button
            size="small"
            variant="outlined"
            className="announceButton"
            onClick={(e) => {
              e.stopPropagation();
              onAnnounce?.(gig);
            }}
          >
            Announce
          </Button>
          {Boolean(gig.announcedAt) && (
            <span
              className="announcedBadge"
              style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}
            >
              announced ✓
            </span>
          )}
        </div>
      )}
      {dateTimeStr && (
        <div className="gig-card-datetime" style={{ fontWeight: 500, marginBottom: '6px' }}>
          {dateTimeStr}
        </div>
      )}
      <div className="gig-card-venue" style={{ marginBottom: '6px' }}>
        {utils.renderVenueCell({ row: gig } as any)}
      </div>
      <div className="gig-card-location" style={{ marginBottom: '8px' }}>
        {utils.renderLocation(gig)}
      </div>
      <div className="gig-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span className="gig-card-tickets">
          {HtmlReactParser(gig.tickets || 'Free')}
        </span>
        {gig.promoImageUrl && (
          // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions
          <img
            src={gig.promoImageUrl}
            alt="gig promo"
            className="gig-card-photo"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
};

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
  const isCardsView = useMediaQuery('(max-width:959px)');
  const isSingleColumn = useMediaQuery('(max-width:599px)');
  const [page, setPage] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [announceGig, setAnnounceGig] = useState<Igig | null>(null);
  useEffect(() => {
    if (showDialog || Boolean(editGig?._id)) {
      setSaveMessage('');
    }
  }, [showDialog, editGig?._id]);
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
      {saveMessage && <div role="status">{saveMessage}</div>}
      {gigsInOrder === null ? (
        <div
          className="gigs-error-message"
          style={{
            color: '#d32f2f',
            textAlign: 'center',
            padding: '20px 10px',
            backgroundColor: '#fde8e8',
            borderRadius: '4px',
            margin: '10px 0',
          }}
        >
          Unable to load gig schedule from the server. Please refresh or try again shortly.
        </div>
      ) : isCardsView ? (
        <div className="gigs-cards-wrapper" style={{ width: '100%' }}>
          <div
            className={`gigs-cards-container ${isSingleColumn ? 'cards-single-col' : 'cards-two-col'}`}
            style={{
              display: 'grid',
              gridTemplateColumns: isSingleColumn ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
              width: '100%',
            }}
          >
            {gigsInOrder.slice(page * pageSize, (page + 1) * pageSize).map((gig) => (
              <GigCard
                key={gig.id ?? gig._id ?? `${gig.venue}-${gig.datetime}`}
                gig={gig}
                isAdmin={isAdmin}
                onAnnounce={(g) => setAnnounceGig(g)}
                onEdit={(g) => utils.clickToEdit(setEditGig, isAdmin, g)}
              />
            ))}
          </div>
          <TablePagination
            component="div"
            count={gigsInOrder.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="gigs-cards-pagination"
          />
        </div>
      ) : (
        <div className="gigs-table-container" style={{ width: '100%' }}>
          <DataGrid
            className={isAdmin ? 'adminGrid' : ''}
            autoHeight
            getRowHeight={() => 'auto'}
            getRowClassName={(params) => {
              const isNudge = isAdmin && utils.isUpcomingGig(params.row) && utils.isWithin10Days(params.row.datetime);
              return isNudge ? 'gig-announce-nudge' : '';
            }}
            onRowClick={(rowParams) => {
              utils.clickToEdit(setEditGig, isAdmin, rowParams.row);
            }}
            rows={gigsInOrder || []}
            columns={makeColumns(false, isAdmin, (gig) => setAnnounceGig(gig))}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => { setPage(model.page); setPageSize(model.pageSize); }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
          />
        </div>
      )}
      <CreateGigDialog showDialog={showDialog} setShowDialog={setShowDialog} onSaveMessage={setSaveMessage} />
      <EditGigDialog
        onSaveMessage={setSaveMessage}
        editGig={editGig}
        setEditGig={setEditGig}
        setShowDialog={setShowDialog}
        setEditChanged={setEditChanged}
        editChanged={editChanged}
        getGigs={getGigs}
        auth={auth}
      />
      <AnnounceGigDialog
        gig={announceGig}
        open={Boolean(announceGig)}
        onClose={() => setAnnounceGig(null)}
        auth={auth}
        onSuccess={() => {
          getGigs?.();
        }}
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
