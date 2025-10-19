import React, { PropsWithChildren, useEffect } from 'react';

import { useProjectStore } from '../stores/useProjectStore';

export const ProjectPersistenceProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const setSaving = useProjectStore((state) => state.setSaving);

  useEffect(() => {
    const timer = setInterval(() => {
      setSaving(false);
    }, 2000);

    return () => clearInterval(timer);
  }, [setSaving]);

  return <>{children}</>;
};
