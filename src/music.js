export class Music {
  slideshowImages = [
    '../static/imgs/martinsville2017.png',
    '../static/imgs/fifthWedAnniversary.png',
    '../static/imgs/prom2015.png',
    '../static/imgs/hiddenValleyTalentShow.png',
    '../static/imgs/ourWedding.png'
  ];

  jump(h) {
    document.getElementById(h).scrollIntoView();
  }
}
