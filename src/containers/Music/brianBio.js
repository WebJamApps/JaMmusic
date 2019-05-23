import React from 'react';

const BrianBio = () => (
  <div className="brianBio">
    <h4 id="brianbio" style={{ marginBottom: '4px' }}>Brian Lilienthal</h4>
    <img
      alt="brian"
      src="../static/imgs/BrianL.png"
      style={{
        width: '288px', display: 'block', margin: 'auto', textAlign: 'center',
      }}
    />
    <p className="bioText">
        Brian has been playing drums for 13 years and his main set is a Pearl Masters MCX.
        His favorite music is Ska music, and his drumming influences are Vinnie Fiorello from
        Less Than Jake, Chris Thatcher from Streetlight Manifesto, Travis
        Barker from Blink-182, Tre Cool from Green Day, and The Rabbit from Reel Big Fish.
        His man crushes are Roger Lima, Gerard Way, and Barack Obama. Looking for a nice girl
        between 23 and 29. Also, Go Hokies!
    </p>
  </div>
);

export default BrianBio;
