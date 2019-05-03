import React, { Component } from 'react';
import PicSlider from '../components/pic-slider';
import { TourTable } from '../components/tour-table';
import JoshBio from './Music/joshBio';
import MariaBio from './Music/mariaBio';
import EmersonBio from './Music/emersonBio';
import BrianBio from './Music/brianBio';
import Wjband from './Music/wjBand';
import Intro from './Music/intro';

export default class Music extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.slideshowImages = [
      { id: 1, url: 'https://dl.dropboxusercontent.com/s/fn0sghlem6gkol5/fifthWedAnniversary.png?dl=0', title: 'Our Wedding' },
      { id: 2, url: '../static/imgs/fifthWedAnniversary.png' },
      { id: 3, url: '../static/imgs/prom2015.png' },
      { id: 4, url: '../static/imgs/hiddenValleyTalentShow.png' },
      { id: 5, url: '../static/imgs/ourWedding.png' }
    ];
    this.originals = `${process.env.BackendUrl}/wj-music/originals`;
  }

  render() {
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1"><PicSlider data={this.slideshowImages} /></div>
        </div>
        <div className="material-content elevation2" style={{ maxWidth: '998px', margin: 'auto' }}>
          <Intro originals={this.originals} />
          <h4 style={{ textAlign: 'center', marginBottom: '4px' }}><strong>Tour</strong></h4>
          <div className="search-table-outer" style={{ position: 'relative', overflowX: 'auto' }}><TourTable /></div>
          <section className="afterTable">
            <JoshBio />
            <hr />
            <MariaBio />
            <hr />
            <Wjband />
            <hr />
            <EmersonBio />
            <hr />
            <BrianBio />
          </section>
        </div>
      </div>
    );
  }
}
