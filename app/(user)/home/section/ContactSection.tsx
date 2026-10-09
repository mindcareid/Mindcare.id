import Container from "@/app/components/reusable/Container";
import { ContactData } from "../../data/contact";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <Container as="section" id="contact" className="scroll-mt-24 pb-20 pt-4">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
              Contact
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              Get in touch
            </h2>
            <p className="text-base text-muted-foreground">
              Questions about the directory, listings, or partnerships? Send us
              a message and we will get back to you.
            </p>
          </div>

          <ul className="space-y-2">
            {ContactData.map((contact) => {
              const Icon = contact.icon;
              return (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    className="group flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-brand-lavender-100"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-lavender-100 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      {contact.title && (
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {contact.title}
                        </span>
                      )}
                      <span className="mt-0.5 block text-sm font-medium leading-relaxed text-foreground">
                        {contact.label}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 md:p-6">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
