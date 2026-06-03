
function Caption(props: { caption?: string }) {
  const { caption } = props;
  return (
    <div
      className="slider-caption"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        boxSizing: 'border-box',
        textAlign: 'center',
        fontWeight: 600,
        padding: '10px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#ffffff',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
        zIndex: 2,
      }}
    >
      {' '}
      {caption}
      {' '}
    </div>
  );
}

Caption.defaultProps = {
  caption: '',
};

export default Caption;
