import { mailTheme } from "../theme";

type HeadingProps = {
  children: string;
};

export function Heading({ children }: HeadingProps) {
  return `
    <h2
      style="
        margin:0;
        color:${mailTheme.primary};
        font-size:24px;
        font-weight:700;
        font-family:Arial,Helvetica,sans-serif;
        text-align:center;
        line-height:32px;
      "
    >
      ${children}
    </h2>
  `;
}