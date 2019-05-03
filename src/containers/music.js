import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PicSlider from '../components/pic-slider';
import { TourTable } from '../components/tour-table';
import JoshBio from './Music/joshBio';
import MariaBio from './Music/mariaBio';
import EmersonBio from './Music/emersonBio';
import BrianBio from './Music/brianBio';
import Wjband from './Music/wjBand';
import Intro from './Music/intro';
import getImages from '../store/fetchActions';

class Music extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.images = props.images;
    this.slideshowImages = [
      { id: 1, url: 'https://dl.dropboxusercontent.com/s/ukewrrbwx07n9mw/fifthWedAnniversary.png?dl=0', title: 'Fifth Wedding Anniversary 2017' },
      { id: 2, url: 'https://dl.dropboxusercontent.com/s/l2n6dvunfyupdv3/Martinsville2017.png?dl=0', title: 'Martinsville 2017' },
      {
        id: 3,
        url: 'https://dl.dropboxusercontent.com/s/7ru06rcgv21xhkz/hiddenValleyTalentShow.png?dl=0',
        title: 'Hidden Valley Highschool Talent Show'
      },
      { id: 4, url: 'https://dl.dropboxusercontent.com/s/tjap0dmegfsjtu5/prom2015.png?dl=0', title: 'Prom 2015' },
      { id: 5, url: 'https://dl.dropboxusercontent.com/s/zfrwmc9dsore9u5/ourWedding.png?dl=0', title: 'Our Wedding' }
    ];
    this.originals = `${process.env.BackendUrl}/wj-music/originals`;
  }

  render() {
    const { dispatch } = this.props;
    dispatch(getImages());
    const { data } = this.props;
    console.log(data.images);
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            {data.isFetching ? <h3 id="appLoading">Loading...</h3> : null}
            {data.isError ? (
              <h3 id="appErr" className="error">{data.error}</h3>
            ) : null}
            {Object.keys(data.images).length > 0 ? (
              <PicSlider data={this.slideshowImages} />
            ) : null}

            {/* <PicSlider data={this.slideshowImages} /> */}
          </div>
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
/* istanbul ignore next */
Music.defaultProps = { dispatch: () => {}, data: { images: [] } };
Music.propTypes = {
  dispatch: PropTypes.func,
  data: PropTypes.shape({
    isFetching: PropTypes.bool,
    isError: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string,
      title: PropTypes.string
    }))
  })
};
/* istanbul ignore next */
const mapStateToProps = state => ({ data: state });
export default connect(mapStateToProps)(Music);
