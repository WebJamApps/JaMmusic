import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function DiagramViewer({ svg, testId }: { svg: string; testId: string }) {
  const [scale, setScale] = useState(1);

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.001}
      limitToBounds={false}
      // Keep wheel changes gentle even when Fit has reduced a large diagram's scale.
      wheel={{ step: scale * 0.0005 }}
      onTransform={(_, state) => setScale(state.scale)}
    >
      {({ zoomIn, zoomOut, fitToView, resetTransform }) => (
        <>
          <Box role="group" aria-label="Diagram controls" sx={{ display: 'flex', gap: 1, marginBottom: 1, flexWrap: 'wrap' }}>
            <Button onClick={() => { void zoomIn(); }}>Plus</Button>
            <Button onClick={() => { void zoomOut(); }}>Minus</Button>
            <Button onClick={() => { void fitToView(); }}>Fit</Button>
            <Button onClick={() => { void resetTransform(); }}>Reset</Button>
          </Box>
          <TransformComponent wrapperStyle={{ width: '100%', height: '32rem' }}>
            <Box
              data-testid={testId}
              sx={{ width: 'max-content', '& svg': { maxWidth: 'none', display: 'block' } }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
}
