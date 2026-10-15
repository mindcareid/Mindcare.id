import { mailTheme } from "../theme";

export function Divider() {
  return `
    <hr
      style="
        margin:36px 0;
        border:none;
        border-top:1px solid ${mailTheme.border};
      "
    />
  `;
}