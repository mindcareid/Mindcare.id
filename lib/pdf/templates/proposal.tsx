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
import { mailConfig } from "@/lib/mail/config";

export type ProposalAgendaRow = {
  time: string;
  title: string;
  speakers?: string;
};

export type ProposalPdfProps = {
  eventTitle: string;

  coverImage?: string;

  date: string;
  time: string;
  location: string;
  format: string;

  description?: string;

  agenda?: ProposalAgendaRow[];

  organizers?: string;

  contactEmail?: string;
};

const CONTAINED_COLORS = {
  sectionTitle: colors.brandPurpleDark,
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

  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.brandPurpleDark,
    lineHeight: 1.3,
  },

  cover: {
    marginTop: 14,
    width: "100%",
    height: 170,
    borderRadius: radius.sm,
    objectFit: "cover",
  },

  metaTable: {
    marginTop: 22,
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },

  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  metaRowLast: {
    flexDirection: "row",
  },

  metaLabelCell: {
    width: 130,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.mint,
  },

  metaLabel: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  metaValueCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  metaValue: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.4,
  },

  section: {
    marginTop: 24,
    marginHorizontal: 40,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: CONTAINED_COLORS.sectionTitle,
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: colors.text,
    textAlign: "justify",
  },

  agendaItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  agendaTime: {
    width: 80,
    fontSize: 10,
    fontWeight: "bold",
    color: colors.brandPurple,
  },

  agendaBody: {
    flex: 1,
  },

  agendaTitle: {
    fontSize: 10.5,
    color: colors.text,
  },

  agendaSpeakers: {
    marginTop: 2,
    fontSize: 9,
    color: colors.muted,
  },

  footer: {
    marginTop: 28,
    marginHorizontal: 40,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },

  footerText: {
    fontSize: 9.5,
    color: colors.text,
    textAlign: "center",
    lineHeight: 1.5,
  },

  footerMuted: {
    marginTop: 4,
    fontSize: 8.5,
    color: colors.muted,
    textAlign: "center",
  },
});

function MetaRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={last ? s.metaRowLast : s.metaRow}>
      <View style={s.metaLabelCell}>
        <Text style={s.metaLabel}>{label}</Text>
      </View>
      <View style={s.metaValueCell}>
        <Text style={s.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ProposalPdf({
  eventTitle,
  coverImage,
  date,
  time,
  location,
  format,
  description,
  agenda,
  organizers,
  contactEmail,
}: ProposalPdfProps) {
  const hasAgenda = Boolean(agenda && agenda.length > 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} />

        <View style={s.header}>
          <Image
            src={`${mailConfig.appUrl}/images/logo/MindcareLogo.png`}
            style={s.logo}
          />
          <Text style={s.docType}>EVENT PROPOSAL</Text>
        </View>

        <View style={s.rule} />

        <View style={s.hero}>
          <Text style={s.eventTitle}>{eventTitle}</Text>
          {coverImage ? <Image src={coverImage} style={s.cover} /> : null}
        </View>

        <View style={s.metaTable}>
          <MetaRow label="Date" value={date} />
          <MetaRow label="Time" value={time} />
          <MetaRow label="Location" value={location} />
          <MetaRow label="Format" value={format} last />
        </View>

        {description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About the Event</Text>
            <Text style={s.paragraph}>{description}</Text>
          </View>
        ) : null}

        {hasAgenda ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Agenda</Text>
            {agenda?.map((row, index) => (
              <View key={index} style={s.agendaItem} wrap={false}>
                <Text style={s.agendaTime}>{row.time}</Text>
                <View style={s.agendaBody}>
                  <Text style={s.agendaTitle}>{row.title}</Text>
                  {row.speakers ? (
                    <Text style={s.agendaSpeakers}>{row.speakers}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={s.footer}>
          {organizers ? (
            <Text style={s.footerText}>Organised by {organizers}</Text>
          ) : null}
          <Text style={[s.footerText, { marginTop: organizers ? 4 : 0 }]}>
            For questions about this proposal, contact{" "}
            {contactEmail ?? mailConfig.supportEmail}.
          </Text>
          <Text style={s.footerMuted}>
            This document was generated automatically by {mailConfig.appName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
