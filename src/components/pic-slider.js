/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Caption from './PicSlider/caption';

class PicSlider extends Component {
  constructor(props) {
    super(props);
    this.data = props.data;
    this.settings = {
      autoplay: true,
      autoplaySpeed: 2000,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
    };
  }

  render() {
    return (
      <div>
        <Slider {...this.settings}>
          {
            this.data.map(data => (
              <div key={data._id}>
                {' '}
                <img width="100%" height="100%" src={data.url} alt={data.title} />
                {' '}
                <Caption caption={data.title} />
              </div>
            ))
          }
        </Slider>
      </div>
    );
  }
}
PicSlider.defaultProps = {
  data: [{ url: '', title: '', _id: 0 }],
};

PicSlider.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape),
};

export default PicSlider;
