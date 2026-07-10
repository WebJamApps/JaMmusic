
const footerLinks = () => {
  const color = 'var(--footer-link)';
  const links = [
    { href: 'https://github.com/WebJamApps', name: 'github' },
    { href: 'https://www.linkedin.com/company/webjam/', name: 'linkedin' },
    { href: 'https://www.instagram.com/joshua.v.sherman/', name: 'instagram' },
    { href: 'https://www.facebook.com/WebJamLLC/', name: 'facebook' },
    { href: 'https://www.youtube.com/@JoshuaShermanMusic', name: 'youtube' },
  ];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      padding: '4px',
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {
          links.map((link) => (
            <a
              key={link.name}
              aria-label={link.name}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color, display: 'inline-flex', alignItems: 'center' }}
              href={link.href}
            >
              <span><i className={`fab fa-${link.name}`} /></span>
            </a>
          ))
        }
      </div>
      <p style={{ color: 'var(--footer-fg)', fontSize: '9pt', margin: 0 }}>
        Powered by
        {' '}
        <a className="wjllc" target="_blank" rel="noopener noreferrer" href="https://www.web-jam.com">Web Jam LLC</a>
      </p>
    </div>
  );
};

export function Footer() {
  return (
    <div
      id="wjfooter"
      className="footer"
      style={{
        backgroundColor: 'var(--footer-bg)', paddingTop: '10px', paddingBottom: '10px', bottom: '0',
      }}
    >
      {footerLinks()}
    </div>
  );
}

