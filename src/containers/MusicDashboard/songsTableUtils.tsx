import React from 'react';

const editSong = (data: any): boolean => {
  // const { dispatch } = this.props;
  const s = data;
  delete s.modify;
  console.log(`superagent put to /song this id: ${s._id}`);
  //   window.location.reload();
  return true;
};

const deleteSong = (songId: string): boolean => { // eslint-disable-next-line no-restricted-globals
  const result = confirm('Deleting Song, are you sure?');// eslint-disable-line no-alert
  if (result) {
    console.log(`superagent delete to /song this id: ${songId}`);
    // const { scc, auth } = this.props;
    // const tour = { tourId };
    // if (scc && auth) {
    //   scc.transmit('deleteTour', { tour, token: auth.token });
    //   window.location.reload();
    return true;
  } return false;
//   } return false;
};

const addButtons = (arr: any[]): any[] => {
  const newArr = arr;/* eslint-disable security/detect-object-injection */
  for (let i = 0; i < arr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
    const deletePicId = `deletePic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
    const editPicId = `editPic${newArr[i]._id}`;// eslint-disable-line security/detect-object-injection
    newArr[i].modify = (// eslint-disable-line security/detect-object-injection
      <div>
        <button type="button" id={deletePicId} onClick={() => deleteSong(newArr[i]._id)}>Delete</button>
        <p>{' '}</p>
        <button type="button" id={editPicId} onClick={() => editSong(newArr[i])}>Edit</button>
      </div>
    );
  }
  return newArr;
};

export default { addButtons };
