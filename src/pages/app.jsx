
import React, { Component } from 'react';
import { PicSlider } from '../components/pic-slider';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.slideshowImages = [
      '../static/imgs/martinsville2017.png',
      '../static/imgs/fifthWedAnniversary.png',
      '../static/imgs/prom2015.png',
      '../static/imgs/hiddenValleyTalentShow.png',
      '../static/imgs/ourWedding.png'
    ];
  }

  render() {
    return (
      <div className="page-content">
        <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
          <div id="musicSlide1">
            <PicSlider data={ this.slideshowImages } />
          </div>
        </div>
        <div className="material-content elevation2" style={{ maxWidth: '998px', margin: 'auto' }}>
          <p style={{ marginTop: '10px' }}>Josh and Maria have been performing their music together for over six years now!
            Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
            Click <a rel="noopener noreferrer" target="_blank" href="https://web-jam.com/music/originals">here</a> to listen.</p>
          <h4 style={{ textAlign: 'center' }}><strong>Tour</strong></h4>
          <div className="search-table-outer" style={{ position: 'relative', overflowX: 'auto' }}>
            <table>
              <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '75px' }}>Time</th>
                <th style={{ minWidth: '150px' }}>Location</th>
                <th style={{ minWidth: '220px' }}>Venue</th>
                <th style={{ minWidth: '120px' }}>Tickets</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Dec 24, 2018</td>
                <td>4:30 pm</td>
                <td>Salem, VA</td>
                <td><a href="http://collegelutheran.org/" rel="noopener noreferrer" target="_blank">College Lutheran Church</a></td>
                <td>Freewill</td>
              </tr>
              <tr>
                <td>Dec 16, 2018</td>
                <td>6:00 pm</td>
                <td>Martinsville, VA</td>
                <td><a href="https://stjoechurch.net/" rel="noopener noreferrer" target="_blank">St. Joseph Catholic Church</a>, Christmas party</td>
                <td>Private</td>
              </tr>
              <tr>
                <td>Dec 7, 2018</td>
                <td>6:00 pm</td>
                <td>Salem, VA</td>
                <td><a href="http://collegelutheran.org/" rel="noopener noreferrer" target="_blank">College Lutheran Church</a> front porch, prior to the Salem Christmas parade</td>
                <td>Free</td>
              </tr>
              <tr>
                <td>Nov 29, 2018</td>
                <td>5:45 pm</td>
                <td>Salem, VA</td>
                <td>Dinner to Honor Volunteers/Supporters of the Salem Clothes Closet</td>
                <td>Private</td>
              </tr>
              <tr>
                <td>Nov 24, 2018</td>
                <td>4:45 pm</td>
                <td>Moneta, VA</td>
                <td><a href="http://www.resurrectioncatholic.org/" rel="noopener noreferrer" target="_blank">Resurrection Catholic Church</a></td>
                <td>Freewill</td>
              </tr>
              <tr>
                <td>Sept 29, 2018</td>
                <td>5:30 pm</td>
                <td>Marion, VA</td>
                <td>Hungry Mother Lutheran Retreat Center
                  <br/>Beer & Brats Fundraiser - <a target="_blank" rel="noopener noreferrer" href="http://hungrymother.org/contact-us/">Contact</a> for more info.</td>
                <td><a target="_blank" rel="noopener noreferrer" href="http://hungrymother.org/give/">Donation</a></td>
              </tr>
              <tr>
                <td>Sept 1, 2018</td>
                <td>4:00 pm</td>
                <td>Bent Mountain, VA</td>
                <td>33rd Annual Pig Roast</td>
                <td>Sold Out</td>
              </tr>
              <tr>
                <td>Aug 4, 2018</td>
                <td>9:00 am</td>
                <td>Salem, VA</td>
                <td><a href="https://www.facebook.com/SalemVaMarket/" rel="noopener noreferrer" target="_blank">Farmers Market</a></td>
                <td>Free</td>
              </tr>
              <tr>
                <td>July 30, 2018</td>
                <td>6:00 pm</td>
                <td>Salem, VA</td>
                <td>
                  <a href="https://www.facebook.com/pages/biz/Majestic-Mic-at-Parkway-Brewery-1146829528673810/" rel="noopener noreferrer" target="_blank">Parkway Brewery</a>
                </td>
                <td>Free</td>
              </tr>
              <tr>
                <td>July 21, 2018</td>
                <td>5:00 pm</td>
                <td>Salem, VA</td>
                <td>
                  <a href="https://www.facebook.com/events/199874127371694/" rel="noopener noreferrer" target="_blank">Web Jam LLC</a>
                </td>
                <td>Private</td>
              </tr>
              <tr>
                <td>July 15, 2018</td>
                <td>9:45 am</td>
                <td>Salem, VA</td>
                <td><a href="http://collegelutheran.org" rel="noopener noreferrer" target="_blank">College Lutheran Church</a></td>
                <td>Freewill</td>
              </tr>
              </tbody>
            </table>
          </div>
          <section>
            <h4 id="joshbio">Josh Sherman</h4>
            <div>
              <img className="alignnone size-full wp-image-49" src="/static/imgs/josh01.jpg" alt="josh01" width="288px"/>
            </div>
            <p style={{ textAlign: 'left' }}>
              Josh began playing the trumpet when he was in third grade. He became skilled with the trumpet,
              continuing with his musical stylings through high school where he was first chair and regular
              soloist on the marching field. In college Josh studied music and picked up the guitar. He was
              primarily self-taught on the guitar, although he received help from his many musical relatives,
              especially his Uncle Mike. Josh went on to found several bands while living in central Florida.
              He recorded two cds and was played on the local radio stations. Josh also played in many
              venues including the Sun cruise casino ship and the Battle of the Bands. His career took a
              different turn when he moved to Virginia. Leaving his band behind, Josh played at the GE Pig
              roast several years and performed solo at Mill Mountain coffee shop and the 4th Street coffee
              shop. Josh started singing with Maria in the fall of 2011. They fell in love and were married
              in July of 2012. Vive l’amore!
            </p>
            <blockquote style={{ fontStyle: 'italic', textAlign: 'left', marginTop: '5px', fontSize: '9pt' }}>
              <p>And whenever the harmful spirit from God was upon Saul, David took the lyre
                and played it with his hand. So Saul was refreshed and was well, and the harmful spirit
                departed from him. <strong>1 Samuel 16:23</strong></p>
            </blockquote>
            <aside style={{ textAlign: 'left', margin: 'auto', width: '3in' }}>
              <p>Instruments that Josh plays:</p>
              <ol>
                <li>Lead vocals</li>
                <li>Harmony vocals</li>
                <li>Acoustic guitar</li>
                <li>Electric guitar</li>
                <li>Harmonica</li>
                <li>Trumpet</li>
                <li>Kazoo</li>
              </ol>
            </aside>
            <hr/>
            <article>
              <h4 id="mariabio">Maria Sherman</h4>
              <div>
                <img className="alignnone size-medium wp-image-50" src="/static/imgs/maria01.jpg" alt="maria01" width="288px"/>
              </div>
              <p style={{ textAlign: 'left' }}>
                Maria started her singing career at the age of 4 when she performed at the JaMar Rec
                Center in St. Petersburg, Florida. Maria continued adding to her musical repertoire
                by learning piano, alto saxophone, tenor saxophone, bassoon, and marching tenors.
                She earned a minor in voice at Roanoke College and did a variety of chorus, musical theatre,
                and solo performances while teaching in the Roanoke County Schools. Although classically
                trained, Maria loves singing rock and Christian music with Josh, and hopes to add bass
                guitar to her list of instruments soon. Josh is the most wonderful husband and is the driving
                force for the couple; Maria is a fabulous wife and is the organization behind the duo.
              </p>
              <blockquote style={{ fontStyle: 'italic', textAlign: 'left', marginTop: '5px', fontSize: '9pt' }}>
                <p>Whoever sings songs to a heavy heart is like one who takes off a garment on a cold
                  day, and like vinegar on soda.
                  <strong>Proverbs 25:20</strong>
                </p>
              </blockquote>
              <aside style={{ textAlign: 'left', margin: 'auto', width: '3in' }}>
                <p>Instruments that Maria plays:</p>
                <ol>
                  <li>Lead vocals</li>
                  <li>Harmony vocals</li>
                  <li>Bass guitar</li>
                  <li>Keyboard</li>
                  <li>Bassoon</li>
                  <li>Saxophone</li>
                  <li>Tri-tom</li>
                </ol>
              </aside>
            </article>
            <br/>
            <hr/>
            <p style={{ textAlign: 'left' }}>The Web Jam Band formed at the beginning of 2017, with a performance at a summer wedding anniversary house party, and performances at the annual Bent
              Mountain Pig Roast.
              Recording sessions were completed at Flat Five Studios, and songs will be made available for streaming in the near future. We are currently seeking a new drummer as Brian has moved
              to Austin, Tx.
            </p>
            <h4 style={{ textAlign: 'center', marginBottom: '5px', marginTop: '10px' }}><strong>Who are these classy people?</strong></h4>
            <table>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', backgroundColor: '#e6ffe6' }}>
                    <a href="#joshbio">
                      <img src="/static/imgs/josh01thumb.jpg" alt="Josh image" width="96" style={{ cursor: 'pointer' }}/>
                    </a>
                    <p>Josh Sherman – rhythm guitarist and baritone vocalist</p>
                  </td>
                  <td style={{ textAlign: 'center', backgroundColor: '#e6ffe6' }}>
                    <a href="#mariabio">
                      <img src="/static/imgs/maria01thumb.jpg" alt="Maria image" width="96" align="center" style={{ cursor: 'pointer' }}/>
                    </a>
                    <p>Maria Sherman – primo soprano and bass guitarist</p>
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center', backgroundColor: '#e6ffe6' }}>
                    <a href="#brianbio">
                      <img src="/static/imgs/brianThumb.png" alt="Brian image" width="96" align="center" style={{ cursor: 'pointer' }}/>
                    </a>
                    <p>Brian Lilienthal – our <strong><i>main</i></strong> drummer and remixer</p>
                  </td>
                  <td style={{ textAlign: 'center', backgroundColor: '#e6ffe6' }}>
                    <a href="#emersonbio">
                      <img src="../static/imgs/emerson.jpg" alt="Emerson image" height="67" align="center" style={{ cursor: 'pointer' }}/>
                    </a>
                    <p>Emerson Harvey – lead guitarist and world traveler</p>
                  </td>
                </tr>
              </tbody>
            </table>
            <hr/>
            <article>
              <h4 id="emersonbio">Emerson Harvey</h4>
              <img alt="emerson" src="../static/imgs/emerson.jpg" style={{ width: '288px', display: 'block', margin: 'auto', textAlign: 'center' }}/>
                <p style={{ maxWidth: '98%', margin: 'auto', textAlign: 'left' }}>
                  In 1969, I was 12 years old, I heard Jimi Hendrix on the radio and decided I had to learn to play guitar. Self taught for
                  48 years now. Play lead and rhythm guitar. Favorite axe is
                  still a Fender Stratocaster!
                  Influences: Jimi Hendrix, Rolling Stones, Sex Pistols, Ramones, X, Talking Heads, BB King, Buddy Guy, Neil Young……. Can work a harmonica and acoustic guitar on demand.
                </p>
                <img alt="young emerson" src="../static/imgs/emersonY.jpg" style={{ width: '288px', display: 'block', margin: 'auto', textAlign: 'center' }}/>
            </article>
            <hr/>
            <article>
              <h4 id="brianbio">Brian Lilienthal</h4>
              <img alt="brian" src="../static/imgs/BrianL.png" style={{ width: '288px', display: 'block', margin: 'auto', textAlign: 'center' }}/>
                <p style={{ maxWidth: '98%', margin: 'auto', textAlign: 'left' }}>
                  Brian has been playing drums for 13 years and his main set is a Pearl Masters MCX. His favorite music is Ska music, and his drumming influences are Vinnie Fiorello from
                  Less Than Jake, Chris Thatcher from Streetlight Manifesto, Travis
                  Barker from Blink-182, Tre Cool from Green Day, and The Rabbit from Reel Big Fish. His man crushes are Roger Lima, Gerard Way, and Barack Obama. Looking for a nice girl
                  between 23 and 29. Also, Go Hokies!
                </p>
            </article>
          </section>
        </div>
      </div>
    );
  }
}
