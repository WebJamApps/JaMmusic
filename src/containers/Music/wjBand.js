import React from 'react';

const Wjband = () => (
  <div className="wjBand" style={{ margin: 'auto' }}>
    <p style={{ textAlign: 'left', marginLeft: '10px', marginRight: '10px' }}>
The Web Jam Band formed at the beginning of 2017,
  with a performance at a summer wedding anniversary house party, and performances at the annual Bent
    Mountain Pig Roast.
    Recording sessions were completed at Flat Five Studios, and songs will be made available for streaming in the near future.
    We are currently seeking a new drummer as Brian has moved
    to Austin, Tx.
    </p>
    <h4 style={{ textAlign: 'center', marginBottom: '5px', marginTop: '10px' }}><strong>Who are these classy people?</strong></h4>
    <table>
      <tbody>
        <tr>
          <td className="wjBand">
            <a href="#joshbio"><img src="/static/imgs/josh01thumb.jpg" alt="Josh Sherman" width="96" /></a>
            <p>Josh Sherman – rhythm guitarist and baritone vocalist</p>
          </td>
          <td className="wjBand">
            <a href="#mariabio"><img src="/static/imgs/maria01thumb.jpg" alt="Maria Sherman" width="96" align="center" /></a>
            <p style={{ marginTop: '2.5px' }}>Maria Sherman – primo soprano and bass guitarist</p>
          </td>
        </tr>
        <tr>
          <td className="wjBand">
            <a href="#brianbio"><img src="/static/imgs/brianThumb.png" alt="Brian Lilienthal" width="96" align="center" /></a>
            <p>
Brian Lilienthal – our
              <strong><i>main</i></strong>
              {' '}
drummer and remixer
            </p>
          </td>
          <td className="wjBand">
            <a href="#emersonbio"><img src="../static/imgs/emerson.jpg" alt="Emerson Harvey" height="67" align="center" /></a>
            <p style={{ marginTop: '.7px' }}>Emerson Harvey – lead guitarist and world traveler</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default Wjband;
