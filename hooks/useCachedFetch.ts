import { useEffect, useRef, useState } from "react";

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>, ttl: number = 60000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        const { data: d, ts } = JSON.parse(cached);
        if (Date.now() - ts < ttl) {
          setData(d);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetcher().then(d => {
      if (mounted.current) {
        setData(d);
        setLoading(false);
        try { sessionStorage.setItem(key, JSON.stringify({ data: d, ts: Date.now() })); } catch {}
      }
    }).catch(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, [key]);

  return { data, loading };
}