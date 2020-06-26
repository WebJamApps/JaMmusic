import React, { Component } from 'react';
import { connect } from 'react-redux';
import PicSlider from '../../components/pic-slider';
import DefaultTable from '../../components/tour-table';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import Intro from './intro';
import mapStoreToProps from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';

type MusicProps = {
  images: {url: string; title: string}[];};
export class Music extends Component<MusicProps> {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  static defaultProps = {
    images: [],
  };

  constructor(props: MusicProps) {
    super(props);
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Music', window.screen.width); }

  musicians() { // eslint-disable-line class-methods-use-this
    return (
      <div className="elevation3" style={{ maxWidth: '1000px', margin: 'auto' }}>
        <section>
          <JoshBio />
          <hr />
          <MariaBio />
        </section>
        <p>{' '}</p>
        <p>{' '}</p>
      </div>
    );
  }

  render() {
    const { images } = this.props;
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            {images.length > 0 ? (<PicSlider data={images} />) : null}
          </div>
          <Intro />
        </div>
        <div
          className="search-table-outer"
          style={{
            position: 'relative', overflowX: 'auto', maxWidth: '96%', margin: 'auto', zIndex: 0,
          }}
        >
          <DefaultTable />
        </div>
        <div style={{ height: '10px' }}>
          <p>{' '}</p>
        </div>
        {this.musicians()}
      </div>
    );
  }
}

export default connect(mapStoreToProps)(Music);
