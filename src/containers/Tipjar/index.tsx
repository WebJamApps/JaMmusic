import { useEffect } from 'react';

export function Tipjar() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    const page = document.getElementById('tipjar');
    if (page) page.appendChild(script);
    const stripeBuyButton = document.createElement('stripe-buy-button');
    stripeBuyButton.setAttribute('buy-button-id', 'buy_btn_1N6vwFDsYgXB9TLItPPDUXYz');
    stripeBuyButton.setAttribute('publishable-key', 'pk_live_QlKzEwDMridKGqkMnkxaTmMR00TEIRN6zI');
    if (page) page.appendChild(stripeBuyButton);
    return () => {
      // clean up the script when the component in unmounted
      if (page) page.removeChild(script);
      if (page) page.removeChild(stripeBuyButton);
    };
  }, []);
  return (
    <div id="tipjar" style={{ margin: 'auto' }} />
  );
}
