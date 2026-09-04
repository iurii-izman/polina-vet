import { useEffect, useMemo, useRef } from 'react';
import {
  VisualEditing,
  type HistoryAdapter,
  type HistoryUpdate,
} from '@sanity/visual-editing/react';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import type { ClientPerspective } from '@sanity/client';

const serialize = (value: ClientPerspective) =>
  typeof value === 'string' ? value : JSON.stringify(value);
const currentUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

export default function SanityVisualEditing() {
  type Navigate = Parameters<HistoryAdapter['subscribe']>[0];
  const navigateRef = useRef<Navigate | undefined>(undefined);
  const lastUrlRef = useRef('');
  useEffect(() => {
    const sync = () => {
      const url = currentUrl();
      if (url !== lastUrlRef.current) {
        lastUrlRef.current = url;
        navigateRef.current?.({ type: 'push', title: document.title, url });
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);
  const history = useMemo<HistoryAdapter>(
    () => ({
      subscribe: (navigate: Navigate) => {
        navigateRef.current = navigate;
        navigate({ type: 'push', title: document.title, url: currentUrl() });
        return () => {
          if (navigateRef.current === navigate) navigateRef.current = undefined;
        };
      },
      update: (update: Pick<HistoryUpdate, 'type' | 'url'>) => {
        if (update.type === 'pop') window.history.back();
        else if (update.type === 'push') window.location.assign(update.url);
        else window.location.replace(update.url);
      },
    }),
    [],
  );
  return (
    <VisualEditing
      history={history}
      portal
      onPerspectiveChange={(perspective) => {
        document.cookie = `${perspectiveCookieName}=${encodeURIComponent(serialize(perspective))}; path=/; SameSite=None; Secure${window.self !== window.top ? '; Partitioned' : ''}`;
        window.location.reload();
      }}
      refresh={() => {
        window.location.reload();
        return Promise.resolve();
      }}
    />
  );
}
