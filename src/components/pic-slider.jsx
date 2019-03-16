import { noView, inject, customElement, bindable } from 'aurelia-framework';
import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

@noView()
@inject(Element)
@customElement('picture-slider')
@bindable('data')
export class PicSlider {
  constructor(element) {
    this.element = element;
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

  html() {
    return (
      <Slider {...this.settings}>
        {this.data.map((data, key) => {
          return <div key={key}><img width='100%' height='100%' src={data}/></div>
        })}
      </Slider>
    )
  }

  render() {
    ReactDOM.render(this.html(), this.element);
  }

  bind() {
    this.render();
  }
}
