import type { Dispatch } from 'react';
import MUIDataTable from 'mui-datatables';
import type { AnyAction } from 'redux';
import type { Iimage } from '../../redux/mapStoreToProps';
import utils from './photoTable.utils';

export const PhotoTable = (props:any):JSX.Element => {

  let dataArr: Iimage[] = props.images;
  dataArr = utils.addThumbs(dataArr, props.controller, props.dispatch);
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
};
