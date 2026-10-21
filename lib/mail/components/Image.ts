type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export function Image({ src, alt, width = 220, height }: ImageProps) {
  const sizeStyle = height
    ? `width:${width}px;height:${height}px;`
    : `width:${width}px;height:auto;`;

  return `
    <img
      src="${src}"
      alt="${alt}"
      width="${width}"
      ${height ? `height="${height}"` : ""}
      style="
        display:block;
        margin:0 auto;
        ${sizeStyle}
        border:0;
        outline:none;
        text-decoration:none;
      "
    />
  `;
}
