type ImageProps = {
  src: string;
  alt: string;
  width?: number;
};

export function Image({
  src,
  alt,
  width = 220,
}: ImageProps) {
  return `
    <img
      src="${src}"
      alt="${alt}"
      width="${width}"
      style="
        display:block;
        margin:auto;
      "
    />
  `;
}