import React from 'react';
import type { Iimage } from '../../redux/mapStoreToProps';

interface ImusicNewProps {
  images:Iimage[]
}
export const MusicNew = ({ images }: ImusicNewProps):JSX.Element =>{
  return (<div>
    <h4>Music New</h4>
    <p>{JSON.stringify(images)}</p>
  </div>);
  
};
