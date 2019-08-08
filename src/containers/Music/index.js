import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PicSlider from '../../components/pic-slider';
import DefaultTable from '../../components/tour-table';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import EmersonBio from './emersonBio';
import BrianBio from './brianBio';
import Wjband from './wjBand';
import Intro from './intro';
// import getImages from './musicActions';
import mapStoreToProps from '../../redux/mapStoreToProps';

export class Music extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    // const { dispatch } = this.props;
    // dispatch(getImages());
  }

  componentDidMount() { document.title = 'Music | Web Jam LLC'; }

  render() {
    const { images } = this.props;
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            {images.length > 0 ? (<PicSlider data={images} />) : null}
          </div>
        </div>
        <div className="material-content elevation2" style={{ maxWidth: '998px', margin: 'auto' }}>
          <Intro originals="/music/originals" />
          <div className="search-table-outer" style={{ position: 'relative', overflowX: 'auto' }}><DefaultTable /></div>
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
/* istanbul ignore next */
Music.defaultProps = { images: [] };
Music.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.string,
  })),
};
/* istanbul ignore next */
// const mapStoreToProps = store => ({ images: store.images });
export default connect(mapStoreToProps)(Music);
