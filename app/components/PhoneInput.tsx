"use client";

import PhoneInputWrapper from "react-phone-number-input";
import type { ComponentProps } from "react";
export default function PhoneInput(
  props: ComponentProps<typeof PhoneInputWrapper>,
) {
  return <PhoneInputWrapper {...props} />;
}
