
function Instruments(props: { type: string }): JSX.Element {
  const { type } = props;
  return (
    <ol className="instruments">
      <li>Lead vocals</li>
      <li>Harmony vocals</li>
      {type === 'Maria' ? (
        <span>
          <li>Bass guitar</li>
          <li>Accordion</li>
          <li>Bassoon</li>
          <li>Saxophone</li>
          <li>Tri-tom</li>
        </span>
      )
        : (
          <span>
            <li>Acoustic guitar</li>
            <li>Electric guitar</li>
            <li>Harmonica</li>
            <li>Trumpet</li>
            <li>Kazoo</li>
          </span>
        )}
    </ol>
  );
}

export default Instruments;
