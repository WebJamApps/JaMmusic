import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import type { Iimage } from '../../redux/mapStoreToProps';
import Caption from './caption';

export interface Isettings {
  autoplay: boolean;
  autoplaySpeed: number;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slidesToScroll: number;
  arrows: boolean;
  fade: boolean;
}
export interface IpicSliderProps {
  data?: Iimage[];
}
export function PicSlider({ data }:IpicSliderProps) {
  const settings:Isettings = {
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
  };
  return (
    <div className="picSlider">
      <Slider {...settings}>
        {
            Array.isArray(data) ? data.map((d) => (
              <div key={d._id}>
                {' '}
                <img className="slide-images" src={d.url} alt={d.title} />
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
