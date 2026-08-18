import { StyleSheet } from "@react-pdf/renderer";

//
// DESIGN TOKENS
//

export const colors = {
  primary: "#2516D3",

  text: "#111827",
  muted: "#6B7280",

  border: "#D1D5DB",

  background: "#F8FAFC",

  white: "#FFFFFF",

  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export const fontSize = {
  xs: 10,
  sm: 11,
  md: 12,
  lg: 14,
  xl: 17,
  xxl: 22,
  title: 34,
};

//
// GLOBAL STYLES
//

export const styles = StyleSheet.create({
  //
  // Page
  //

  page: {
    padding: spacing.xxl,

    backgroundColor: colors.white,

    fontFamily: "Helvetica",

    fontSize: fontSize.sm,

    color: colors.text,
  },

  //
  // Typography
  //

  text: {
    fontSize: fontSize.md,

    color: colors.text,
  },

  muted: {
    color: colors.muted,
  },

  title: {
    fontSize: fontSize.title,

    fontWeight: "bold",

    fontStyle: "italic",

    letterSpacing: 1,

    color: colors.text,
  },

  heading: {
    fontSize: fontSize.xl,

    fontWeight: "bold",

    marginBottom: spacing.md,
  },

  paragraph: {
    fontSize: fontSize.md,

    lineHeight: 1.7,

    color: colors.text,
  },

  small: {
    fontSize: fontSize.xs,
  },

  //
  // Layout
  //

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: spacing.lg,
  },

  section: {
    marginBottom: spacing.lg,
  },

  center: {
    alignItems: "center",

    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
  },

  rowBetween: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  //
  // Card
  //

  card: {
    borderWidth: 1,

    borderColor: colors.primary,

    borderRadius: radius.md,

    backgroundColor: colors.white,

    padding: spacing.lg,
  },

  //
  // Divider
  //

  divider: {
    height: 2,

    backgroundColor: colors.primary,

    marginVertical: spacing.md,
  },

  //
  // Label / Value
  //

  labelRow: {
    flexDirection: "row",

    marginBottom: spacing.sm,
  },

  label: {
    width: 85,

    fontWeight: "bold",
  },

  separator: {
    width: 10,
  },

  value: {
    flex: 1,
  },

  //
  // QR
  //

  qrWrapper: {
    width: 130,

    height: 130,

    borderWidth: 2,

    borderColor: colors.text,

    borderRadius: radius.lg,

    alignItems: "center",

    justifyContent: "center",
  },

  qrImage: {
    width: 95,

    height: 95,
  },

  //
  // Footer
  //

  footer: {
    marginTop: spacing.xl,
  },

  footerDivider: {
    height: 2,

    backgroundColor: colors.primary,

    marginBottom: spacing.md,
  },

  footerRow: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  footerText: {
    fontSize: fontSize.xs,
  },

  footerMuted: {
    color: colors.muted,
  },

  ticketTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginTop: 12,
  },

  ticketSubtitle: {
    fontSize: 10,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
});