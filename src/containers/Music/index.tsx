import React, { useEffect } from 'react';
import PicSlider from 'src/components/PicSlider';
import DefaultTable from '../../components/TourTable';
// import { Gigs } from '../Gigs';
import type { Iimage } from '../../redux/mapStoreToProps';
import Intro from './intro';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import WjBand from './wjBand';
import commonUtils from '../../lib/commonUtils';

export const Musicians = (): JSX.Element => { // eslint-disable-line class-methods-use-this
  return (
    <div className="elevation3" style={{ maxWidth: '1000px', margin: 'auto' }}>
      <section>
        <JoshBio />
        <hr />
        <MariaBio />
        <hr />
        <WjBand />
      </section>
      <p>{' '}</p>
      <p>{' '}</p>
    </div>
  );
};

interface ImusicNewProps {
  images?:Iimage[]
}
export const Music = ({ images }: ImusicNewProps):JSX.Element =>{
  useEffect(()=>commonUtils.setTitleAndScroll('Music', window.screen.width), []);
  const data = Array.isArray(images) ? images : [];
  return (
    <div className="page-content">
      <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
        <div id="musicSlide1">
          {data.length > 0 ? (<PicSlider data={data} />) : null}
        </div>
        <Intro />
      </div>
      <div
        className="search-table-outer"
        style={{
          position: 'relative', overflowX: 'auto', maxWidth: '96%', margin: 'auto', zIndex: 0,
        }}
      >
        {/* <Gigs/> */}
        {process.env.NODE_ENV !== 'test' ? /*istanbul ignore next*/<DefaultTable /> : null}
      </div>
      <div style={{ height: '10px' }}>
        <p>{' '}</p>
      </div>
      <Musicians/>
    </div>
  );
  
};
