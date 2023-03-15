import { Component } from 'react';
import Jsb from './BuyLinks/joshShermanBand';
import Jss from './BuyLinks/joshShermanSolo';
import Jsyt from './MediaLinks/joshShermanYoutube';
import Jssp from './MediaLinks/joshShermanSpotify';
import Jsam from './MediaLinks/joshShermanApple';
import commonUtils from '../../lib/utils';

export default class BuyMusic extends Component {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  constructor(props: Record<string, unknown>) {
    super(props);
    this.commonUtils = commonUtils;
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Buy Music', window.screen.width); }

  render(): JSX.Element {
    return (
      <div
        className="page-content"
        style={{
          paddingRight: '15px', maxWidth: '800px', margin: 'auto', borderRight: 'none',
        }}
      >
        <h2 style={{
          textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '10px',
        }}
        >
          Buy from CD Baby
        </h2>
        <div className="row top-row-style">
          <Jsb />
          <Jss />
        </div>
        <Jssp />
        <Jsyt />
        <Jsam />
      </div>
    );
  }
}
