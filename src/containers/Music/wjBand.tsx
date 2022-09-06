
function WjBand(): JSX.Element {
  return (
    <div className="wjBand" style={{ textAlign: 'left' }}>
      <p style={{ textAlign: 'center', marginBottom: '4px' }}>
        <strong>The Web Jam Band</strong>
      </p>
      <p style={{ padding: '8px', paddingTop: '0px', marginTop: '0px' }}>
        The Web Jam Band formed at the beginning of 2017, with performances at a summer wedding anniversary house party,
        and the annual Bent Mountain Pig Roast.
        Recording sessions were completed at Flat Five Studios. The project ended after Brian moved to Austin, Tx.
      </p>
      <table>
        <tbody>
          <tr style={{ backgroundColor: '#fff' }}>
            <td>
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <img src="/static/imgs/brianThumb.png" alt="Brian Lilienthal" height="100" />
                <p>
                  Brian Lilienthal –
                  <strong><i>main</i></strong>
                  {' '}
                  drummer and remixer
                </p>
              </div>
            </td>
            <td>
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <img src="../static/imgs/emerson.jpg" alt="Emerson Harvey" height="100" />
                <p>Emerson Harvey – lead guitarist and world traveler</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ height: '10px' }}>{' '}</p>
    </div>
  );
}

export default WjBand;
