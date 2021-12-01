import React from 'react';

const JoshShermanYoutube = ():JSX.Element => (
    <div className='youtube' style={{ marginBottom:'14px' }}>
        <hr/>
    <h5>Also On YouTube</h5>
    <div className="material-content elevation2" style={{ maxWidth: '4in', margin: 'auto', height: '2in' }}>
        <a href="https://youtube.com/playlist?list=OLAK5uy_nmxiOsu9BvdnwfHZ2w4ix3AG0POpsJPKA" 
        className='fab fa-youtube fa-1x' style={{ color:'#333333', marginTop:'18px' }}
        > <strong>Josh Sherman</strong><br/><i>Solo Acoustic</i></a>
        <br/>
        <a href="https://youtube.com/playlist?list=OLAK5uy_mtLf1U_oKuSgkFRcXYpo5E0OJWnvRt1TI" 
        className='fab fa-youtube fa-1x' style={{ color:'#333333', marginTop:'18px' }}
        > <strong>Josh Sherman Band</strong><br/><i>live from central Florida, 2001 - 2005</i></a>
        </div>
    </div>
);

export default JoshShermanYoutube;
