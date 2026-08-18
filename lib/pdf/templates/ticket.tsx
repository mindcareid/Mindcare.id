/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import { styles } from "../styles";

import { Logo } from "../components/Logo";
import { Divider } from "../components/Divider";
import { Section } from "../components/Section";
import { Card } from "../components/Card";
import { Heading } from "../components/Heading";
import { Footer } from "../components/Footer";
import { Label } from "../components/Label";
import { Value } from "../components/Value";
import { QrCode } from "../components/QrCode";
import { stripHtml } from "@/lib/utils/stripHtml";

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

  description,
}: TicketPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}

        <Logo />
        <Text style={styles.ticketTitle}>
          E-TICKET
        </Text>

        <Text style={styles.ticketSubtitle}>
          Your Admission Pass
        </Text>

        <Divider />

        {/* ================= EVENT ================= */}

        <Section title="Event Information">
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {/* LEFT */}

              <View
                style={{
                  width: "72%",
                  flexDirection: "row",
                }}
              >
                <Image
                  src={eventImage}
                  style={{
                    width: 95,
                    height: 95,
                    marginRight: 18,
                    objectFit: "cover",
                  }}
                />

                <View style={{ flex: 1 }}>
                  <Heading>{eventTitle}</Heading>

                  <View style={styles.labelRow}>
                    <Label label="Date" />
                    <Value>{date}</Value>
                  </View>

                  <View style={styles.labelRow}>
                    <Label label="Time" />
                    <Value>{time}</Value>
                  </View>

                  <View style={styles.labelRow}>
                    <Label label="Venue" />
                    <Value>{venue}</Value>
                  </View>

                  <View style={styles.labelRow}>
                    <Label label="Booking" />
                    <Value>{bookingCode}</Value>
                  </View>
                </View>
              </View>

              {/* RIGHT */}

              <View
                style={{
                  width: "24%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <QrCode value={qrCode} />
              </View>
            </View>
          </Card>
        </Section>

        {/* ================= DESCRIPTION ================= */}

        <Section title="Event Details">
          <Card>
            <Text style={styles.paragraph}>
              {stripHtml(description)}
            </Text>
          </Card>
        </Section>

        {/* ================= PARTICIPANT ================= */}

        <Section title="Participant">
          <Card>
            <View style={styles.labelRow}>
              <Label label="Name" />
              <Value>{attendeeName}</Value>
            </View>

            <View style={styles.labelRow}>
              <Label label="Email" />
              <Value>{email}</Value>
            </View>

            {company && (
              <View style={styles.labelRow}>
                <Label label="Company" />
                <Value>{company}</Value>
              </View>
            )}

            {position && (
              <View style={styles.labelRow}>
                <Label label="Position" />
                <Value>{position}</Value>
              </View>
            )}
          </Card>
        </Section>

        {/* ================= FOOTER ================= */}

        <Footer />
      </Page>
    </Document>
  );
}