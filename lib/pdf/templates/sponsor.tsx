/* eslint-disable jsx-a11y/alt-text */
// Gambar di bawah dirender @react-pdf/renderer, bukan elemen <img> HTML, jadi
// prop `alt` tidak berlaku dan aturan jsx-a11y tidak relevan di file ini.
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { colors, fontSize, radius } from "../styles";
import { mailConfig } from "@/lib/mail/config";
// Satu sumber format harga. Sebelumnya file ini punya salinan sendiri,
// sehingga PDF dan email bisa menampilkan angka berbeda untuk pengajuan
// yang sama.
import { priceLines } from "@/lib/sponsors/money";

export type SponsorPdfBenefit = {
  title: string;
  detail?: string;
};

export type SponsorConfirmationPdfProps = {
  referenceNo: string;
  companyName: string;
  companyAddress: string;
  companyCountry: string;
  companyWebsite?: string | null;
  companyEmail?: string | null;
  picName: string;
  picPosition: string;
  picPhone: string;
  picEmail: string;
  notes?: string | null;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  tierName: string;
  priceAmount: number;
  currency: string;
  displayUsd?: number | null;
  benefits: SponsorPdfBenefit[];
  submittedAt: Date;
  supportEmail: string;
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

  accentBar: { height: 6, backgroundColor: colors.brandPurple },

  header: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { width: 132 },

  docType: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.brandPurple,
    letterSpacing: 2,
  },

  rule: {
    height: 2,
    marginHorizontal: 40,
    backgroundColor: colors.brandPurple,
  },

  hero: {
    marginTop: 22,
    marginHorizontal: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPurpleWash,
    borderWidth: 1,
    borderColor: colors.lavenderStrong,
    padding: 20,
  },

  referenceLabel: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  reference: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
    letterSpacing: 1.5,
  },

  eventTitle: {
    marginTop: 12,
    fontSize: 13,
    color: colors.text,
    lineHeight: 1.4,
  },

  section: { marginTop: 22, marginHorizontal: 40 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { flexDirection: "row" },

  labelCell: {
    width: 140,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.mint,
  },

  labelText: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  valueCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 12 },
  valueText: { fontSize: 10.5, color: colors.text, lineHeight: 1.4 },

  priceBox: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.lavender,
  },

  priceAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
  },

  priceUsd: { marginTop: 2, fontSize: 10, color: colors.muted },

  benefitRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  benefitTitle: {
    width: "48%",
    fontSize: 10,
    color: colors.text,
    paddingRight: 8,
  },
  benefitDetail: { flex: 1, fontSize: 10, color: colors.muted },

  paragraph: { fontSize: 10.5, lineHeight: 1.6, color: colors.text },

  footer: {
    marginTop: 24,
    marginHorizontal: 40,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },

  footerText: {
    fontSize: 9,
    color: colors.text,
    textAlign: "center",
    lineHeight: 1.5,
  },
  footerMuted: {
    marginTop: 4,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
});

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={last ? s.rowLast : s.row}>
      <View style={s.labelCell}>
        <Text style={s.labelText}>{label}</Text>
      </View>
      <View style={s.valueCell}>
        <Text style={s.valueText}>{value}</Text>
      </View>
    </View>
  );
}
export function SponsorConfirmationPdf({
  referenceNo,
  companyName,
  companyAddress,
  companyCountry,
  companyWebsite,
  companyEmail,
  picName,
  picPosition,
  picPhone,
  picEmail,
  notes,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  tierName,
  priceAmount,
  currency,
  displayUsd,
  benefits,
  submittedAt,
  supportEmail,
}: SponsorConfirmationPdfProps) {
  const submitted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(submittedAt);

  const price = priceLines({ amount: priceAmount, currency, displayUsd });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} />

        <View style={s.header}>
          <Image
            src={`${mailConfig.appUrl}/images/logo/MindcareLogo.png`}
            style={s.logo}
          />
          <Text style={s.docType}>SPONSORSHIP REQUEST</Text>
        </View>

        <View style={s.rule} />

        <View style={s.hero}>
          <Text style={s.referenceLabel}>Reference number</Text>
          <Text style={s.reference}>{referenceNo}</Text>
          <Text style={s.eventTitle}>{eventTitle}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Event</Text>
          <View style={s.table}>
            <Row label="Date" value={eventDate} />
            <Row label="Time" value={eventTime} />
            <Row label="Location" value={eventLocation} last />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Package</Text>
          <View style={s.table}>
            <Row label="Package" value={tierName} />
            <Row label="Submitted" value={submitted} last />
          </View>

          <View style={s.priceBox}>
            <Text style={s.priceAmount}>{price.primary}</Text>
            {price.secondary ? (
              <Text style={s.priceUsd}>
                Approximately {price.secondary}. Indicative only — the amount
                payable is {price.primary} and is confirmed in the invoice.
              </Text>
            ) : null}
          </View>
        </View>

        {benefits.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>What this package includes</Text>
            <View style={s.table}>
              {benefits.map((benefit, index) => (
                <View
                  key={`${benefit.title}-${index}`}
                  style={
                    index === benefits.length - 1
                      ? [s.benefitRow, { borderBottomWidth: 0 }]
                      : s.benefitRow
                  }
                  wrap={false}
                >
                  <Text style={s.benefitTitle}>{benefit.title}</Text>
                  <Text style={s.benefitDetail}>{benefit.detail ?? "—"}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Company</Text>
          <View style={s.table}>
            <Row label="Company" value={companyName} />
            <Row label="Address" value={companyAddress} />
            <Row label="Country" value={companyCountry} />
            <Row label="Website" value={companyWebsite ?? "—"} />
            <Row label="Company email" value={companyEmail ?? "—"} last />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Contact person</Text>
          <View style={s.table}>
            <Row label="Name" value={picName} />
            <Row label="Position" value={picPosition} />
            <Row label="Phone" value={picPhone} />
            <Row label="Email" value={picEmail} last />
          </View>
        </View>

        {notes ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Note to organizer</Text>
            <Text style={s.paragraph}>{notes}</Text>
          </View>
        ) : null}

        <View style={s.footer}>
          <Text style={s.footerText}>
            This document confirms that MindCare received your sponsorship
            request. It is not an invoice and no payment has been taken.
          </Text>
          <Text style={s.footerMuted}>
            Our sponsorship team will contact you to arrange the invoice.
            Questions? Write to {supportEmail} and quote reference {referenceNo}
            .
          </Text>
        </View>
      </Page>
    </Document>
  );
}
