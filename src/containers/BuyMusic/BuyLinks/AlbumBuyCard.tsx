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
        <h5 style={{ textAlign: 'center' }}>{heading}</h5>
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
