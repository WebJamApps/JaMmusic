import React from 'react';
import PropTypes from 'prop-types';

const footerLinks = () => {
  const color = '#c09580';
  const links = [
    { href: 'https://github.com/WebJamApps', name: 'github' },
    { href: 'https://www.linkedin.com/company/webjam/', name: 'linkedin' },
    { href: 'https://www.instagram.com/joshua.v.sherman/', name: 'instagram' },
    { href: 'https://twitter.com/JoshuaVSherman', name: 'twitter' },
    { href: 'https://www.facebook.com/WebJamLLC/', name: 'facebook' },
    { href: 'https://joshuavsherman.tumblr.com/', name: 'tumblr' },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '6px' }}>
      {
        links.map((link) => (
          <a key={Math.random().toString()} target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href={link.href}>
            <span><i className={`fab fa-${link.name}`} /></span>
          </a>
        ))
      }
      <p style={{ color: 'white', fontSize: '9pt', marginBottom: 0 }}>
        Powered by
        {' '}
        <a className="wjllc" target="_blank" rel="noopener noreferrer" href="https://www.web-jam.com">Web Jam LLC</a>
      </p>
    </div>
  );
};

const Footer = (props) => {
  const { noContent } = props;
  return (
    <div
      id="wjfooter"
      className={`${noContent} footer`}
      style={{
        backgroundColor: '#565656', paddingTop: '20px', paddingBottom: '20px', marginTop: 'calc(5% + 60px)', bottom: '0',
      }}
    >
      { footerLinks() }
    </div>
  );
};
Footer.propTypes = {
  noContent: PropTypes.string,
};

Footer.defaultProps = {
  noContent: '',
};

export default Footer;
