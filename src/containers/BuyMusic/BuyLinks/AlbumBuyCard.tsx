interface IalbumBuyCardProps {
  heading: string;
  href: string;
  img: string;
  alt: string;
  title: string;
}

export function AlbumBuyCard({
  heading, href, img, alt, title,
}: IalbumBuyCardProps) {
  return (
    <div className="col">
      <div className="material-content elevation2" style={{ maxWidth: '360px', width: '100%', margin: 'auto', height: '380px' }}>
        {/* h3 keeps heading order valid after the page h2 (axe heading-order);
            font styles pinned to the old h5 look so the card is unchanged */}
        <h3 style={{ textAlign: 'center', fontSize: '1.2rem', margin: '12px 0' }}>{heading}</h3>
        <div style={{ textAlign: 'center' }}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            style={{ textDecoration: 'none' }}
          >
            <img
              src={img}
              alt={alt}
              style={{
                width: '200px', height: '200px', display: 'block', margin: '0 auto 16px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                background: '#ff9900',
                color: '#131921',
                fontWeight: 700,
                padding: '8px 24px',
                borderRadius: '4px',
                fontSize: '15px',
              }}
            >
              <i className="fas fa-shopping-cart" style={{ marginRight: '6px' }} aria-hidden="true" />
              Buy on Amazon
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AlbumBuyCard;
