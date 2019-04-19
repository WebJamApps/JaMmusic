<<<<<<< HEAD

import React, { Component } from 'react';
import ReactPlayer from 'react-player';


export class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.index = 0;
    this.playing = false;
    this.playEnd = this.playEnd.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.share = this.share.bind(this);
    this.copyShare = this.copyShare.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.shown = false;
    this.navigator = navigator;
    this.isShuffleOn = false;
    this.first = true;
    this.urls = this.data = this.props.data;
    this.url = this.urls[0];
    // after the component is bound to the DOM. remove the swiping-area from the DOM.
    const swipe = document.getElementsByClassName('swipe-area');
    if (swipe.length) {
      swipe[0].style.display = 'none';
    }
  }

  reactPlayer() {
    return (
      <ReactPlayer
        style={{ backgroundColor: '#eee', textAlign: 'center' }}
        url={this.url.url}
        playing={this.playing}
        controls
        onEnded={this.playEnd}
        width="100%"
        id="mainPlayer"
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    );
  }

  buttons() {
    return (
      <section className="mt-0 col-12 col-md-7">
        <button id="play-pause" role="menu" onClick={this.play}>Play/Pause</button>
        <button role="menu" onClick={this.next}>Next</button>
        <button role="menu" onClick={this.prev}>Prev</button>
        <button id="shuffle" role="menu" onClick={this.shuffle}>Shuffle</button>
        <button role="menu" onClick={this.share}>Share</button>
        <button role="menu">
          <a id="homeLink" href="/?reload=true">Home</a>
        </button>
      </section>
    );
  }

  render() {
    return (
      <div className="container-fluid">
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center' }}>
            {this.reactPlayer()}
          </section>
          <section className="col-12 row col-md-7 m-0 mt-2 d-none" id="copier">
            <div id="copyInput">
              <input id="copyUrl" disabled value={this.playUrl} style={{ backgroundColor: '#fff' }} className="" />
            </div>
            <div id="copyButton" onKeyPress={this.pressKey} role="presentation" onClick={this.copyShare} style={{ cursor: 'pointer' }}>
              <span id="inputGroup" style={{ fontSize: '0.8em' }}>Copy URL</span>
            </div>
          </section>
          <section id="copyMessage" className="col-12 col-md-7 d-none m-0">
            <span className="text-success" style={{ fontSize: '0.8em' }}>Url copied Url to clipboard</span>
          </section>
          <section className="col-12 col-md-7 mt-1" style={{ fontSize: '0.8em' }}>
            {this.url.title}
          </section>
          {this.buttons()}
        </div>
      </div>
    );
  }

  pressKey() {}

  get playUrl() {
    return `${document.location.origin}/music/${this.url.category}?oneplayer=true&id=${this.url.id}`;
  }

  /**
   * Shuffles array in place. ES6 version
   */
  shuffle() {
    if (this.isShuffleOn) {
      this.urls = this._urls;
      this.isShuffleOn = false;
      document.getElementById('shuffle').classList.remove('on');
    } else {
      this.urls = this.urls.slice();
      for (let i = this.urls.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.urls[i], this.urls[j]] = [this.urls[j], this.urls[i]];
      }
      document.getElementById('shuffle').classList.add('on');
      this.isShuffleOn = true;
    }
    this.index = 0;
    this.url = this.urls[this.index];
    this.bind();
  }

  playEnd() {
    this.next();
  }

  playTrue() {
    this.bind();
  }

  prev() {
    this.index -= 1;
    if (this.index < 0) {
      this.index = this.urls.length - 1;
      this.url = this.urls[this.index];
    } else {
      this.url = this.urls[this.index];
    }
    this.playTrue();
  }

  play() {
    this.playing = !this.playing;
    if (this.playing) {
      document.getElementById('play-pause').classList.remove('off');
      document.getElementById('play-pause').classList.add('on');
    } else {
      document.getElementById('play-pause').classList.remove('on');
      document.getElementById('play-pause').classList.add('off');
    }
    this.bind();
  }

  pause() {
    this.playing = false;
    this.bind();
  }

  next() {
    this.index += 1;
    if (this.index >= this.urls.length) {
      this.index = 0;
      this.url = this.urls[this.index];
    } else {
      this.url = this.urls[this.index];
    }
    this.playTrue();
  }

  share() {
    const el = document.getElementById('copier');
    if (this.shown) {
      el.classList.add('d-none');
      this.shown = false;
    } else {
      el.classList.remove('d-none');
      this.shown = true;
    }
  }

  copyShare() {
    this.navigator.clipboard.writeText(this.playUrl).then(() => {
      this.share();

      const el = document.getElementById('copyMessage');

      el.classList.remove('d-none');

      setTimeout(() => {
        el.classList.add('d-none');
      }, 1500);
    });
  }
}
=======
//
// import React, { Component } from 'react';
// import ReactPlayer from 'react-player';
//
//
// export class MusicPlayer extends Component {
//   constructor(props) {
//     super(props);
//     this.play = this.play.bind(this);
//     this.index = 0;
//     this.playing = false;
//     this.playEnd = this.playEnd.bind(this);
//     this.pause = this.pause.bind(this);
//     this.shuffle = this.shuffle.bind(this);
//     this.share = this.share.bind(this);
//     this.copyShare = this.copyShare.bind(this);
//     this.next = this.next.bind(this);
//     this.prev = this.prev.bind(this);
//     this.shown = false;
//     this.navigator = navigator;
//     this.isShuffleOn = false;
//     this.first = true;
//     this.urls = this.data = this.props.data;
//
//     // after the component is bound to the DOM. remove the swiping-area from the DOM.
//     const swipe = document.getElementsByClassName('swipe-area');
//     if (swipe.length) {
//       swipe[0].style.display = 'none';
//     }
//   }
//
//   reactPlayer() {
//     return (
//       <ReactPlayer
//         style={{ backgroundColor: '#eee', textAlign: 'center' }}
//         url={this.url.url}
//         playing={this.playing}
//         controls
//         onEnded={this.playEnd}
//         width="100%"
//         id="mainPlayer"
//         config={{ file: { attributes: { controlsList: 'nodownload' } } }}
//       />
//     );
//   }
//
//   buttons() {
//     return (
//       <section className="mt-0 col-12 col-md-7">
//         <button id="play-pause" role="menu" onClick={this.play}>Play/Pause</button>
//         <button role="menu" onClick={this.next}>Next</button>
//         <button role="menu" onClick={this.prev}>Prev</button>
//         <button id="shuffle" role="menu" onClick={this.shuffle}>Shuffle</button>
//         <button role="menu" onClick={this.share}>Share</button>
//         <button role="menu">
//           <a id="homeLink" href="/?reload=true">Home</a>
//         </button>
//       </section>
//     );
//   }
//
//   render() {
//     return (
//       <div className="container-fluid">
//         <div id="player" className="mb-2 row justify-content-md-center">
//           <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center' }}>
//             {this.reactPlayer()}
//           </section>
//           <section className="col-12 row col-md-7 m-0 mt-2 d-none" id="copier">
//             <div id="copyInput">
//               <input id="copyUrl" disabled value={this.playUrl} style={{ backgroundColor: '#fff' }} className="" />
//             </div>
//             <div id="copyButton" onKeyPress={this.pressKey} role="presentation" onClick={this.copyShare} style={{ cursor: 'pointer' }}>
//               <span id="inputGroup" style={{ fontSize: '0.8em' }}>Copy URL</span>
//             </div>
//           </section>
//           <section id="copyMessage" className="col-12 col-md-7 d-none m-0">
//             <span className="text-success" style={{ fontSize: '0.8em' }}>Url copied Url to clipboard</span>
//           </section>
//           <section className="col-12 col-md-7 mt-1" style={{ fontSize: '0.8em' }}>
//             {this.url.title}
//           </section>
//           {this.buttons()}
//         </div>
//       </div>
//     );
//   }
//
//   pressKey() {}
//
//   get playUrl() {
//     return `${document.location.origin}/music/${this.url.category}?oneplayer=true&id=${this.url.id}`;
//   }
//
//   /**
//    * Shuffles array in place. ES6 version
//    */
//   shuffle() {
//     if (this.isShuffleOn) {
//       this.urls = this._urls;
//       this.isShuffleOn = false;
//       document.getElementById('shuffle').classList.remove('on');
//     } else {
//       this.urls = this.urls.slice();
//       for (let i = this.urls.length - 1; i > 0; i -= 1) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [this.urls[i], this.urls[j]] = [this.urls[j], this.urls[i]];
//       }
//       document.getElementById('shuffle').classList.add('on');
//       this.isShuffleOn = true;
//     }
//     this.index = 0;
//     this.url = this.urls[this.index];
//     this.bind();
//   }
//
//   playEnd() {
//     this.next();
//   }
//
//   playTrue() {
//     this.bind();
//   }
//
//   prev() {
//     this.index -= 1;
//     if (this.index < 0) {
//       this.index = this.urls.length - 1;
//       this.url = this.urls[this.index];
//     } else {
//       this.url = this.urls[this.index];
//     }
//     this.playTrue();
//   }
//
//   play() {
//     this.playing = !this.playing;
//     if (this.playing) {
//       document.getElementById('play-pause').classList.remove('off');
//       document.getElementById('play-pause').classList.add('on');
//     } else {
//       document.getElementById('play-pause').classList.remove('on');
//       document.getElementById('play-pause').classList.add('off');
//     }
//     this.bind();
//   }
//
//   pause() {
//     this.playing = false;
//     this.bind();
//   }
//
//   next() {
//     this.index += 1;
//     if (this.index >= this.urls.length) {
//       this.index = 0;
//       this.url = this.urls[this.index];
//     } else {
//       this.url = this.urls[this.index];
//     }
//     this.playTrue();
//   }
//
//   share() {
//     const el = document.getElementById('copier');
//     if (this.shown) {
//       el.classList.add('d-none');
//       this.shown = false;
//     } else {
//       el.classList.remove('d-none');
//       this.shown = true;
//     }
//   }
//
//   copyShare() {
//     this.navigator.clipboard.writeText(this.playUrl).then(() => {
//       this.share();
//
//       const el = document.getElementById('copyMessage');
//
//       el.classList.remove('d-none');
//
//       setTimeout(() => {
//         el.classList.add('d-none');
//       }, 1500);
//     });
//   }
// }
>>>>>>> 9c59d0887b1ee5747b88720138011f9c18296049
