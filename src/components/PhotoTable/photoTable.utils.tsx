import type { MUIDataTableColumnDef } from 'mui-datatables';
import HtmlReactParser from 'html-react-parser';

import type { Iimage } from '../../redux/mapStoreToProps';

const editPic = (data: Iimage, dispatch: (arg0: { type: string; data: Iimage; }) => void): boolean => {
  delete data.modify;
  dispatch({ type: 'EDIT_PIC', data });
  return true;
};

const addThumbs = (
  arr: Iimage[],
  controller: { deleteData: (arg0: string, arg1: string | undefined) => void; },
  dispatch: (arg0: { type: string; data: Iimage; }) => void,
): Iimage[] => {
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
        <button type="button" id={editPicId} onClick={() => editPic(newArr[i], dispatch)}>
          Edit Pic
        </button>
      </div>
    );
  }
  return newArr;
};

const setCustomBody = (value:any, label:string):JSX.Element => {
  if (typeof value !== 'string' && label !== 'Modify') value = '';
  return (
    <div style={{
      margin: 0, fontSize: '12pt', maxWidth: '200px',
    }}
    >
      {label !== 'Modify' ? HtmlReactParser(value) : value}
    </div>
  );
};

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
        customBodyRender: (value:any) => setCustomBody(value, label),
      },
    });
  }
  return columns;
};

export default {
  editPic, addThumbs, setColumns, setCustomBody,
};
