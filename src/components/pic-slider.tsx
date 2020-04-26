/* eslint-disable react/jsx-props-no-spreading */
import React, { Component } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Caption from './PicSlider/caption';

export interface PicSliderProps {
  settings: any;
  data: any;
}

class PicSlider extends Component<PicSliderProps> {
  static defaultProps: { data: [{ url: ''; title: '';_id: 0 }]; settings };

  settings: {
    autoplay: boolean;
    autoplaySpeed: number;
    infinite: boolean;
    speed: number;
    slidesToShow: number;
    slidesToScroll: number;
    arrows: boolean;
    fade: boolean;
  };

  constructor(props) {
    super(props);
    this.settings = {
      autoplay: true,
      autoplaySpeed: 3000,
      infinite: true,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
    };
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        <Slider {...this.settings}>
          {
            data.map((d) => (
              <div key={d._id}>
                {' '}
                <img width="100%" height="100%" src={d.url} alt={d.title} />
                {' '}
                <Caption caption={d.title} />
              </div>
            ))
          }
        </Slider>
      </div>
    );
  }
}

export default PicSlider;
