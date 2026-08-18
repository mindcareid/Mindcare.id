import { Text } from "@react-pdf/renderer";
import { styles, colors } from "../styles";

type HeadingProps = {
  children: string;

  size?: number;

  color?: string;

  align?: "left" | "center" | "right";

  marginBottom?: number;

  italic?: boolean;
};

export function Heading({
  children,
  size = 18,
  color = colors.text,
  align = "left",
  marginBottom = 10,
  italic = false,
}: HeadingProps) {
  return (
    <Text
      style={{
        ...styles.heading,

        fontSize: size,

        color,

        textAlign: align,

        marginBottom,

        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {children}
    </Text>
  );
}