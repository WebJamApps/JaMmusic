import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { DataContext, Ipic } from 'src/providers/Data.provider';
import { useContext } from 'react';
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

export const SliderContent = ({ pics, settings }: { pics: Ipic[] | null, settings:Isettings }) => {
  if (pics === null) {
    return (
      <div
        className="pics-error-message"
        style={{
          color: '#ffffff',
          textAlign: 'center',
          padding: '40px 20px',
          background: 'black',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Unable to load photos from the server. Please refresh or try again shortly.
      </div>
    );
  }
  if (!Array.isArray(pics) || pics.length === 0) return null;
  return (
    <div className="picSlider">
      <Slider {...settings}>
        {pics.map((d) => (
          <div key={d._id} style={{ position: 'relative', height: '100%' }}>
            {' '}
            <img className="slide-images" src={d.url} alt={d.title} />
            {' '}
            {d.comments === 'showCaption' ? <Caption caption={d.title} /> : null}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export function PicSlider() {
  const { pics } = useContext(DataContext);
  const settings: Isettings = {
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
    <SliderContent pics={pics} settings={settings} />
  );
}
