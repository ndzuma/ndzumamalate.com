import type { ComponentProps } from "react";
import type { Components } from "react-markdown";

/** Markdown images get the same doubled frame as every other image on the site. */
function MarkdownImage({ alt = "", ...props }: ComponentProps<"img">) {
  return (
    <span className="image-frame not-prose my-8">
      <span className="image-frame-inner">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary URLs from markdown */}
        <img alt={alt} {...props} />
      </span>
    </span>
  );
}

export const markdownComponents: Components = { img: MarkdownImage };
