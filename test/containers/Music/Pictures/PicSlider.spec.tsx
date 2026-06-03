import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Isettings, PicSlider, SliderContent } from 'src/containers/Music/Pictures/PicSlider';

const data: any = [
  { _id: 1, url: '/imgs/ohaf/slideshow2.png', comments: 'showCaption' },
  { _id: 2, url: '/imgs/ohaf/slideshow3.png' },
  { _id: 3, url: '/imgs/ohaf/slideshow4.png' },
  { _id: 4, url: '/imgs/ohaf/slideshow5.png' },
  { _id: 5, url: '/imgs/ohaf/slideshow6.png' },
];

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

describe('picture slider component test', () => {
  it('is defined', () => {
    expect(PicSlider).toBeDefined();
  });
  it('renders SliderContent when having pics', () => {
    const { container } = render(<SliderContent pics={data} settings={settings} />);
    expect(container.querySelector('.slick-list')).toBeInTheDocument();
  });
});
