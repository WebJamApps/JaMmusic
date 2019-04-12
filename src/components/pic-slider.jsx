
import React, { Component } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


export class PicSlider extends Component {
  constructor(props) {
    super(props);
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
      <Slider {...this.settings}>
        {
          this.props.data.map((data, key) => <div key={key}> <img width="100%" height="100%" src={data} alt="Image"/> </div>)
        }
      </Slider>
    );
  }
}
