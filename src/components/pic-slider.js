import React, { Component } from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export class PicSlider extends Component { // eslint-disable-line import/prefer-default-export
  constructor(props) {
    super(props);
    this.data = props.data;
    this.caption = props.caption;
    this.settings = {
      autoplay: true,
      autoplaySpeed: 2000,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true
    };
  }

  render() {
    return (
      <div>
        <Slider {...this.settings}>
          {
            this.data.map((data, key) => (
              <div key={key}>
                {' '}
                <img width="100%" height="100%" src={data} alt="Image" />
                {' '}
              </div>
            ))
          }
        </Slider>
        <div
          className="slider-caption"
          style={{
            textAlign: 'center',
            fontWeight: 600,
            padding: '15px 0',
            boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.14)',
            backgroundColor: '#fff',
            marginBottom: '10px',
            marginTop: '-5px'
          }}
        >
          {' '}
          {this.caption}
          {' '}

        </div>
      </div>
    );
  }
}
PicSlider.defaultProps = {
  data: [''],
  caption: ''
};

PicSlider.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string),
  caption: PropTypes.string
};
