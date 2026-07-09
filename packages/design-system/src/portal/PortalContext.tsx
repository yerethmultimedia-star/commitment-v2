import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PortalContextType {
  mount: (id: string, children: React.ReactNode) => void;
  update: (id: string, children: React.ReactNode) => void;
  unmount: (id: string) => void;
}

export const PortalContext = createContext<PortalContextType | null>(null);

export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortalContext must be used within a PortalProvider');
  }
  return context;
};

export interface PortalProviderProps {
  children: React.ReactNode;
}

export const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
  const [portals, setPortals] = useState<Record<string, React.ReactNode>>({});

  const mount = useCallback((id: string, node: React.ReactNode) => {
    setPortals((prev) => ({ ...prev, [id]: node }));
  }, []);

  const update = useCallback((id: string, node: React.ReactNode) => {
    setPortals((prev) => ({ ...prev, [id]: node }));
  }, []);

  const unmount = useCallback((id: string) => {
    setPortals((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ mount, update, unmount }}>
      {children}
      <PortalHost portals={portals} />
    </PortalContext.Provider>
  );
};

interface PortalHostProps {
  portals: Record<string, React.ReactNode>;
}

const PortalHost: React.FC<PortalHostProps> = ({ portals }) => {
  return (
    <>
      {Object.entries(portals).map(([id, node]) => (
        <React.Fragment key={id}>{node}</React.Fragment>
      ))}
    </>
  );
};
