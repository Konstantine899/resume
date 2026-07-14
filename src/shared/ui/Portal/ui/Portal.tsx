import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PortalProps } from '../model/types';

export const Portal = memo((props: PortalProps) => {
  const { children, element } = props;

  const container = element ?? document.body;

  // Dev warning: explicit element not in DOM
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && element && !element.isConnected) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Portal] The provided element is not connected to the DOM. ' +
          'Portal children will not render in the expected container.'
      );
    }
  }, [element]);

  return createPortal(children, container);
});

Portal.displayName = 'Portal';
