"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

/**
 * The presentation video behind a clean cover (the name, the length, a play button) instead of a
 * cropped frame; a click hides the cover and starts the video with its own controls.
 */
export function VideoPlayer({
  src,
  title,
  duration,
  label,
  cta,
}: {
  src: string;
  title: string;
  duration: string;
  label: string;
  cta: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  return (
    <div className="pj-video">
      <video
        ref={ref}
        src={src}
        controls={on}
        playsInline
        preload="none"
        aria-label={label}
        className="aspect-video w-full bg-surface"
      />
      {!on && (
        <button
          type="button"
          className="pj-video-cover"
          onClick={() => {
            setOn(true);
            void ref.current?.play();
          }}
        >
          <span className="pj-video-play">
            <Play aria-hidden className="size-6 fill-current" />
          </span>
          <span className="pj-video-name">{title}</span>
          <span className="pj-video-meta">
            {cta} · {duration}
          </span>
        </button>
      )}
    </div>
  );
}
