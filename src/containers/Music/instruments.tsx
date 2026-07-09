
function Instruments(props: { type: string }) {
  const { type } = props;
  return (
    <ol className="instruments">
      <li>Lead vocals</li>
      <li>Harmony vocals</li>
      {/* fragments, not <span>, so the <ol> only directly contains <li>
          (axe list / listitem rules) */}
      {type === 'Maria' ? (
        <>
          <li>Bass guitar</li>
          <li>Accordion</li>
          <li>Bassoon</li>
          <li>Saxophone</li>
          <li>Tri-tom</li>
        </>
      )
        : (
          <>
            <li>Acoustic guitar</li>
            <li>Electric guitar</li>
            <li>Harmonica</li>
            <li>Trumpet</li>
            <li>Kazoo</li>
          </>
        )}
    </ol>
  );
}

export default Instruments;
