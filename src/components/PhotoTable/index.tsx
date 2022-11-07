import type { Dispatch } from 'react';
import MUIDataTable from 'mui-datatables';
import type { AnyAction } from 'redux';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Iimage } from '../../redux/mapStoreToProps';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';
import utils from './photoTable.utils';

type PTprops = {
  dispatch: Dispatch<AnyAction>,
  images: Iimage[],
  controller:MusicDashboardController,
  auth:Iauth,
};

export function PhotoTable(props: PTprops):JSX.Element {
  const {
    dispatch, images, controller, auth,
  } = props;
  const dataArr = utils.addThumbs(auth, images, controller, dispatch);
  return (
    <div className="photoTable">
      <div style={{ maxWidth: '9in', margin: 'auto' }}>
        <MUIDataTable
          options={{
            filterType: 'dropdown',
            pagination: false,
            responsive: 'standard',
            filter: false,
            download: false,
            search: false,
            print: false,
            viewColumns: false,
            selectableRows: 'none',
            fixedHeader: false,
          }}
          columns={utils.setColumns()}
          data={dataArr}
          title=""
        />
      </div>
    </div>
  );
}
