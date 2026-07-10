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
      <div className="material-content elevation2" style={{ maxWidth: '3in', margin: 'auto', height: '3in' }}>
        {/* h3 keeps heading order valid after the page h2 (axe heading-order);
            font styles pinned to the old h5 look so the card is unchanged */}
        <h3 style={{ textAlign: 'center', fontSize: '0.83em', margin: '1.67em 0' }}>{heading}</h3>
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
                width: '150px', height: '150px', display: 'block', margin: '0 auto 12px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                background: '#ff9900',
                color: '#131921',
                fontWeight: 700,
                padding: '6px 18px',
                borderRadius: '4px',
                fontSize: '13px',
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
