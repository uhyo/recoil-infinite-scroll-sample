import { FC, useEffect, useRef } from "react";
import { usePaging } from "../../dataflow/pokemonList";

/**
 * Loading component.
 * Triggers an incremental loading when intersects with viewport.
 */
export const Loading: FC = () => {
  const observedRef = useRef<HTMLParagraphElement | null>(null);
  const { loadNextPage } = usePaging();

  useEffect(() => {
    if (observedRef.current === null) {
      return undefined;
    }
    let lastTriggerTime = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (lastTriggerTime + 1000 <= Date.now()) {
              lastTriggerTime = Date.now();
              loadNextPage();
            }
          }
        }
      },
      {
        rootMargin: "0px 0px 100px 0px",
      }
    );
    observer.observe(observedRef.current);
    return () => {
      observer.disconnect();
    };
  }, [loadNextPage]);

  return <p ref={observedRef}>Loading...</p>;
};
