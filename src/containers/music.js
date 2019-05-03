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

export class Music extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    this.originals = `${process.env.BackendUrl}/wj-music/originals`;
    const { dispatch } = this.props;
    dispatch(getImages());
  }

  render() {
    const { data } = this.props;
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            {data.isFetching ? <h3 id="appLoading">Loading...</h3> : null}
            {data.isError ? (<h3 id="appErr" className="error">{data.error}</h3>) : null}
            {Object.keys(data.images).length > 0 ? (<PicSlider data={data.images} />) : null}
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
