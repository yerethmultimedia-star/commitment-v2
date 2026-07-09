import React, { useEffect, useRef } from 'react';
import { usePortalContext } from './PortalContext.js';

let nextId = 0;

export interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const { mount, update, unmount } = usePortalContext();
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    idRef.current = `portal-${nextId++}`;
  }

  const id = idRef.current;

  // Mount/Unmount
  useEffect(() => {
    mount(id, children);
    return () => {
      unmount(id);
    };
  }, [id, mount, unmount]);

  // Update
  useEffect(() => {
    update(id, children);
  }, [id, children, update]);

  return null;
};

Portal.displayName = 'Portal';
