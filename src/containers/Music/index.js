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
import mapStoreToProps from '../../redux/mapStoreToProps';

export class Music extends Component {
  constructor(props) { // eslint-disable-line no-useless-constructor
    super(props);
  }

  componentDidMount() { document.title = 'Music | Web Jam LLC'; }

  // componentDidUpdate(prevProps) {
  //   console.log(prevProps.tour.length);//eslint-disable-line
  //   console.log(this.props.tour.length);//eslint-disable-line
  //   console.log(prevProps.tourUpdated);//eslint-disable-line
  //   console.log(this.props.tourUpdated);//eslint-disable-line
  //   if(!prevProps.tourUpdated && this.props.tourUpdated) {
  //     this.rebuildTable = true;
  //     this.props.dispatch({type:'TOUR_RESET'})
  //   }
  //   else
  // }

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
          <Intro />
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

Music.defaultProps = { images: [] };
Music.propTypes = {
  // tourUpdated: PropTypes.bool.isRequired,
  // tour: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.string,
  })),
};

export default connect(mapStoreToProps)(Music);
