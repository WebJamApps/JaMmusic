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
import getImages from './musicActions';

export class Music extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    const { dispatch } = this.props;
    dispatch(getImages());
  }

  componentDidMount() { document.title = 'Music | Web Jam LLC'; }

  render() {
    const { images } = this.props;
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            {images.isFetching ? <h3 id="appLoading">Loading...</h3> : null}
            {/* {images.isError ? (<h3 id="appErr" className="error">{images.error}</h3>) : null} */}
            {images.images.length > 0 ? (<PicSlider data={images.images} />) : null}
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
Music.defaultProps = { dispatch: () => {}, images: { images: [] } };
Music.propTypes = {
  dispatch: PropTypes.func,
  images: PropTypes.shape({
    isFetching: PropTypes.bool,
    isError: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string,
      title: PropTypes.string,
    })),
  }),
};
/* istanbul ignore next */
const mapStoreToProps = store => ({ images: store.images });
export default connect(mapStoreToProps)(Music);
