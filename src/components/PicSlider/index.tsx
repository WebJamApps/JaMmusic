/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import type { Iimage } from '../../redux/mapStoreToProps';
import Caption from './caption';

export interface PicSliderProps {
  data?: Iimage[];
}

class PicSlider extends React.Component<PicSliderProps> {
  static defaultProps: { data: [{ url: ''; title: ''; _id: 0 }]; };

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

  constructor(props: PicSliderProps) {
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

  render(): JSX.Element {
    const { data } = this.props;
    return (
      <div>
        <Slider {...this.settings}>
          {
            Array.isArray(data) ? data.map((d) => (
              <div key={d._id}>
                {' '}
                <img className="slide-images" src={d.url} alt={d.title}/>
                {' '}
                {d.comments === 'showCaption' ? <Caption caption={d.title} /> : null }
              </div>
            ))
              : null
          }
        </Slider>
      </div>
    );
  }
}

export default PicSlider;
