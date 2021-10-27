import React, { Dispatch } from 'react';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import HtmlReactParser from 'html-react-parser';
import type { AnyAction } from 'redux';
import type { Iimage } from '../../redux/mapStoreToProps';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';

const setColumns = (): MUIDataTableColumnDef[] => {
  const columns: MUIDataTableColumnDef[] = [];
  const titles = ['Thumbnail', 'Title', 'Caption', 'Link', 'Type', 'Modify'];
  for (let i = 0; i < titles.length; i += 1) {
    const label = titles[i];// eslint-disable-line security/detect-object-injection
    columns.push({
      name: label.toLowerCase(),
      label,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value:any) => {
          if (typeof value !== 'string' && label !== 'Modify') value = '';
          return (
          <div style={{
            margin: 0, fontSize: '12pt', maxWidth: '200px',
          }}
          >
            {label !== 'Modify' ? HtmlReactParser(value) : value}
          </div>
          );
        },
      },
    });
  }
  return columns;
};

type PTprops = {
  dispatch: Dispatch<AnyAction>,
  auth: { token: string },
  images: Iimage[],
  controller:MusicDashboardController,
};

export const PhotoTable = (props: PTprops):JSX.Element => {

  const editPic = (data: Iimage): boolean => {
    const { dispatch } = props;
    delete data.modify;
    dispatch({ type: 'EDIT_PIC', data });
    return true;
  };

  const addThumbs = (arr: Iimage[]): Iimage[] => {
    const { controller } = props;
    const newArr = arr;/* eslint-disable security/detect-object-injection */
    for (let i = 0; i < arr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
      newArr[i].thumbnail = `<img src=${arr[i].url} width="200px"/>`;
      const deletePicId = `deletePic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      const editPicId = `editPic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
      newArr[i].link = `<a href=${arr[i].url} target="_blank">click to view</a>`;// eslint-disable-line security/detect-object-injection
      newArr[i].caption = newArr[i].comments === 'showCaption' ? 'display' : 'hide';
      newArr[i].modify = (// eslint-disable-line security/detect-object-injection
        <div>
          <button
            type="button"
            id={deletePicId}
            onClick={() => {
              controller.deleteData('deleteImage', newArr[i]._id);
            }}
          >
            Delete Pic
          </button>
          <p>{' '}</p>
          <button type="button" id={editPicId} onClick={() => { editPic(newArr[i]); }}>
            Edit Pic
          </button>
        </div>
      );
    }
    return newArr;
  };

  let arr: Iimage[] = props.images;
  arr = addThumbs(arr);
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
            columns={setColumns()}
            data={arr}
            title=""
          />
        </div>
      </div>
  );
};
