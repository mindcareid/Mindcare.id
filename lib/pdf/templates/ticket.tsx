/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { colors, fontSize, radius } from "../styles";
import { QrCode } from "../components/QrCode";
import { mailConfig } from "@/lib/mail/config";

export type TicketPdfProps = {
  eventTitle: string;

  eventImage: string;

  qrCode: string;

  bookingCode: string;

  attendeeName: string;

  email: string;

  company?: string;

  position?: string;

  date: string;

  time: string;

  venue: string;

  description?: string;
};

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
    fontSize: fontSize.sm,
    color: colors.text,
  },

  accentBar: {
    height: 6,
    backgroundColor: colors.brandPurple,
  },

  header: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 132,
  },

  docType: {
    alignItems: "flex-end",
  },

  docTypeLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.brandPurple,
    letterSpacing: 2,
  },

  badge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.mintStrong,
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.accent,
    letterSpacing: 1,
  },

  rule: {
    height: 2,
    marginHorizontal: 40,
    backgroundColor: colors.brandPurple,
  },

  body: {
    paddingHorizontal: 40,
    paddingTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },

  mainCol: {
    width: "62%",
    flexDirection: "column",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
    lineHeight: 1.3,
    textAlign: "left",
    marginBottom: 12,
  },

  thumb: {
    width: 84,
    height: 84,
    marginRight: 14,
    borderRadius: radius.sm,
    objectFit: "cover",
  },

  metaGridRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  metaCell: {
    flex: 1,
    marginRight: 14,
  },

  metaCellLast: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text,
  },

  qrPanel: {
    width: "34%",
    borderRadius: radius.lg,
    backgroundColor: colors.brandPurpleWash,
    borderWidth: 1,
    borderColor: colors.lavenderStrong,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },

  qrCaption: {
    marginTop: 14,
    fontSize: 8,
    color: colors.brandPurple,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  qrCode: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
    letterSpacing: 1,
  },

  perforation: {
    marginTop: 24,
    marginBottom: 22,
    marginHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: "dashed",
  },

  participant: {
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  participantCol: {
    width: "62%",
  },

  sectionLabel: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  participantName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
  },

  participantEmail: {
    marginTop: 3,
    fontSize: 11,
    color: colors.muted,
  },

  companyBox: {
    width: "34%",
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignSelf: "stretch",
  },

  companyLine: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 3,
  },

  footer: {
    marginTop: 30,
    marginHorizontal: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },

  footerText: {
    fontSize: 10,
    color: colors.text,
    textAlign: "center",
  },

  footerMuted: {
    marginTop: 4,
    fontSize: 9,
    color: colors.muted,
    textAlign: "center",
  },
});

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

export function TicketPdf({
  eventTitle,
  eventImage,
  qrCode,

  bookingCode,

  attendeeName,
  email,
  company,
  position,

  date,
  time,
  venue,
}: TicketPdfProps) {
  const hasCompany = Boolean(company || position);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} />

        {/* ================= HEADER ================= */}

        <View style={s.header}>
          <Image
            src={`${mailConfig.appUrl}/images/logo/MindcareLogo.png`}
            style={s.logo}
          />

          <View style={s.docType}>
            <Text style={s.docTypeLabel}>E-TICKET</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>CONFIRMED</Text>
            </View>
          </View>
        </View>

        <View style={s.rule} />

        {/* ================= EVENT + QR (2 kolom) ================= */}

        <View style={s.body}>
          <View style={s.mainCol}>
            <Text style={s.eventTitle}>{eventTitle}</Text>

            <View style={s.titleRow}>
              <Image src={eventImage} style={s.thumb} />
            </View>

            <View style={s.metaGridRow}>
              <View style={s.metaCell}>
                <Meta label="Date" value={date} />
              </View>
              <View style={s.metaCellLast}>
                <Meta label="Time" value={time} />
              </View>
            </View>

            <View style={s.metaGridRow}>
              <View style={s.metaCell}>
                <Meta label="Venue" value={venue} />
              </View>
              <View style={s.metaCellLast}>
                <Meta label="Booking" value={bookingCode} />
              </View>
            </View>
          </View>

          <View style={s.qrPanel}>
            <QrCode value={qrCode} size={120} />
            <Text style={s.qrCaption}>Scan at check-in</Text>
            <Text style={s.qrCode}>{bookingCode}</Text>
          </View>
        </View>

        {/* ================= PERFORATION ================= */}

        <View style={s.perforation} />

        {/* ================= PARTICIPANT (kiri-kanan) ================= */}

        <View style={s.participant}>
          <View style={s.participantCol}>
            <Text style={s.sectionLabel}>Participant</Text>
            <Text style={s.participantName}>{attendeeName}</Text>
            <Text style={s.participantEmail}>{email}</Text>
          </View>

          {hasCompany && (
            <View style={s.companyBox}>
              {company && <Text style={s.companyLine}>{company}</Text>}
              {position && (
                <Text style={[s.companyLine, { color: colors.muted }]}>
                  {position}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ================= FOOTER ================= */}

        <View style={s.footer}>
          <Text style={s.footerText}>
            Present this QR code at the entrance for check-in.
          </Text>
          <Text style={s.footerMuted}>
            This document was generated automatically by {mailConfig.appName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
