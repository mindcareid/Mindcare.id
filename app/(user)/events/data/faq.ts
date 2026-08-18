export type FaqItem = {
  question: string;
  answer: string;
};

export const getFaqItems = (eventTitle: string): FaqItem[] => [
  {
    question: `How do I order a ticket or register for this event ${eventTitle}`,
    answer: `If tickets are available for ${eventTitle}, they will appear on this page along with a "Buy Ticket" button. Click the button to view and purchase the available tickets.`,
  },
  {
    question: "Where can I find my ticket?",
    answer:
      "After completing your payment, your ticket will be sent via Email or dashboard/ticket.",
  },
  {
    question: "Are refunds available?",
    answer:
      "Refunds are generally not available for purchased tickets. However, you can contact our customer service team to confirm based on the event's policy.",
  },
];
