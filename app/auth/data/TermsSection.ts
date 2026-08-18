import { TermsDocument } from "../type/Terms";

// export const PrivacyPolicy: TermsSection[] = [
//   {
//     type: "bullet",
//     title: "1. Scope of This Privacy Policy",
//     group: [
//       {
//         intro:
//           "This Privacy Policy applies to all users of ExeCorner, including:",
//         items: [
//           "Individual users (Business professionals, contributors, readers)",
//           "Corporate users and representatives",
//           "Service providers and vendors registered on the Platform",
//         ],
//       },
//     ],
//     outro:
//       "This Policy applies only to information directly collected through the Platform and does not apply to third-party websites or services linked from ExeCorner.",
//   },
//   {
//     type: "bullet",
//     title: "2. Personal Data We Collect",
//     group: [
//       {
//         intro: "Information You Provide Directly",
//         items: [
//           "Name, job title, company name",
//           "Email address, phone number, and contact details",
//           "Account login credentials",
//           "Company and service provider profile information",
//           "Content you submit, such as articles, comments, or inquiries",
//         ],
//       },
//       {
//         intro: "b. Information Collected Automatically",
//         items: [
//           "IP address and device information",
//           "Browser type and operating system",
//           "Pages visited, time spent, and interaction data",
//           "Cookies and similar tracking technologies",
//         ],
//       },
//     ],
//   },
//   {
//     type: "bullet",
//     title: "3. Purpose of Data Collection",
//     group: [
//       {
//         intro: "We collect and use personal data for the following purposes:",
//         items: [
//           "To operate, maintain, and improve the Platform",
//           "To manage user accounts and service provider listings",
//           "To facilitate communication between users and service providers",
//           "To publish articles, insights, and platform content",
//           "To personalize user experience and platform recommendations",
//           "To send administrative, service-related, or promotional communications (where permitted)",
//           "To comply with legal and regulatory obligations",
//         ],
//       },
//     ],
//     outro:
//       "ExeCorner may edit, suspend, or remove service listings that violate these Provider Terms or applicable laws.",
//   },
//   {
//     type: "bullet",
//     title: "4. Legal Basis for Processing",
//     group: [
//       {
//         intro:
//           "Personal data is processed based on one or more of the following legal grounds:",
//         items: [
//           "User consent",
//           "Performance of a contract or pre-contractual obligations",
//           "Compliance with legal obligations",
//           "Legitimate interests of ExeCorner, provided such interests do not override user rights",
//         ],
//       },
//     ],
//   },
//   {
//     type: "bullet",
//     title: "5. Data Sharing and Disclosure",
//     group: [
//       {
//         intro:
//           "We do not sell personal data. Personal data may be shared only in the following circumstances:",
//         items: [
//           "With service providers or partners necessary to operate the Platform",
//           "Between users and service providers for legitimate business inquiries",
//           "With authorities or regulators when required by law",
//           "In connection with a business transfer, merger, or acquisition",
//         ],
//       },
//     ],
//     outro:
//       "All third parties receiving data are required to protect it in accordance with applicable laws.",
//   },
//   {
//     type: "bullet",
//     title: "6. . Cookies and Tracking Technologies",
//     group: [
//       {
//         intro: "ExeCorner uses cookies and similar technologies to:",
//         items: [
//           "Ensure platform functionality",
//           "Analyze platform performance and usage",
//           "Improve user experience",
//         ],
//       },
//     ],
//     outro:
//       "Users may control or disable cookies through browser settings. Disabling cookies may affect certain Platform features.",
//   },
//   {
//     type: "text",
//     title: "7. Data Retention",
//     body: "We retain personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
//   },
//   {
//     type: "text",
//     title: "8. Data Security",
//     body: "We implement reasonable administrative, technical, and organizational measures to protect personal data against unauthorized access, disclosure, alteration, or destruction. However, no system can be guaranteed to be completely secure.",
//   },
//   {
//     type: "bullet",
//     title: "9. User Rights",
//     group: [
//       {
//         intro:
//           "In accordance with applicable data protection laws, users may have the right to:",
//         items: [
//           "Access their personal data",
//           "Request correction or updates to inaccurate data",
//           "Request deletion of personal data",
//           "Withdraw consent where processing is based on consent",
//           "Object to or restrict certain processing activities",
//         ],
//       },
//     ],
//     outro: "Requests may be submitted via the contact details provided below.",
//   },
//   {
//     type: "text",
//     title: "10. Third-Party Links",
//     body: "The Platform may contain links to third-party websites. ExeCorner is not responsible for the privacy practices or content of such external sites.",
//   },
//   {
//     type: "text",
//     title: "11.Updates to This Privacy Policy",
//     body: "We may update this Privacy Policy from time to time. Changes will be effective upon posting on the Platform. Continued use of the Platform after updates constitutes acceptance of the revised Policy.",
//   },
//   {
//     type: "text",
//     title: "12. Governing Law",
//     body: "This Privacy Policy shall be governed by and construed in accordance with the laws of the Republic of Indonesia, including applicable data protection regulations.",
//   },
//   {
//     type: "text",
//     title: "13. Governing Law",
//     body: "These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia, without regard to conflict of law principles. If you have any questions regarding these Terms & Conditions, please contact us via email.",
//   },
//   {
//     type: "support",
//     bodySupport:
//       "If you have questions regarding these Terms & Conditions, please contact us at: info@executivecorner.id",
//   },
// ];

export const execornerTerms: TermsDocument = {
  parts: [
    {
      part: "PART I",
      title: "General Terms",
      sections: [
        {
          number: "1",
          title: "Platform Role",
          subsections: [
            {
              number: "1.1",
              title: "Role of the Platform",
              content: [
                {
                  type: "text",
                  body: "ExeCorner operates solely as an electronic system provider and technology intermediary that facilitates connections between Users and independent Providers through the Platform. Except where expressly stated otherwise, ExeCorner does not own, operate, control, manage, employ, or deliver the courses, events, products, or services made available by Providers.",
                },
              ],
            },
            {
              number: "1.2",
              title: "Third-Party Providers",
              content: [
                {
                  type: "text",
                  body: "All Providers offering services through the Platform operate as independent third parties. Unless expressly stated otherwise, ExeCorner does not own, employ, control, endorse, or manage any Provider or the courses, events, products, or services they offer. Each Provider is solely responsible for the quality, accuracy, pricing, legality, scheduling, and delivery of its own services.",
                },
              ],
            },
            {
              number: "1.3",
              title: "Relationship of the Parties",
              content: [
                {
                  type: "text",
                  body: "Any booking, registration, purchase, or other transaction made through the Platform creates a direct contractual relationship solely between the User and the relevant Provider. ExeCorner acts solely as a technology intermediary and is not a party to any agreement, transaction, or other legal relationship entered into between a User and a Provider. Nothing in these Terms shall be construed as creating any agency, employment, partnership, joint venture, franchise, or similar legal relationship between ExeCorner and any User or Provider.",
                },
              ],
            },
            {
              number: "1.4",
              title: "Responsibility for Third-Party Services",
              content: [
                {
                  type: "text",
                  body: "Providers are solely responsible for the fulfillment, delivery, modification, cancellation, quality, legality, pricing, scheduling, certifications, refunds, and overall performance of the courses, events, products, and services they offer through the Platform. To the fullest extent permitted by applicable law, ExeCorner shall not be responsible or liable for any acts, omissions, loss, damage, claim, dispute, or liability arising out of or relating to any course, event, product, or service provided by a Provider. Any complaints, claims, or disputes relating to such services must be addressed directly to the relevant Provider. Where appropriate, ExeCorner may, at its sole discretion, facilitate communication between Users and Providers. Any such assistance is provided solely as a facilitator and shall not create any obligation for ExeCorner to investigate complaints, resolve disputes, provide refunds, pay compensation, or otherwise assume any responsibility or liability in relation to a Provider's services.",
                },
              ],
            },
          ],
        },
        {
          number: "2",
          title: "Eligibility and User Accounts",
          subsections: [
            {
              number: "2.1",
              title: "Eligibility",
              content: [
                {
                  type: "text",
                  body: "Users must be at least 17 years of age to access or use the Platform. Users under the age of 17 may only access or use the Platform with the consent and supervision of a parent or legal guardian.",
                },
              ],
            },
            {
              number: "2.2",
              title: "Account Registration",
              content: [
                {
                  type: "text",
                  body: "Certain features of the Platform, including registering for events, publishing content, and accessing other designated services, require Users to create and maintain an Account.",
                },
              ],
            },
            {
              number: "2.3",
              title: "Account Information",
              content: [
                {
                  type: "text",
                  body: "Users agree to provide accurate, current, and complete information when creating an Account and to promptly update such information to ensure that it remains accurate and complete.",
                },
              ],
            },
            {
              number: "2.4",
              title: "Account Security",
              content: [
                {
                  type: "text",
                  body: "Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted through their account.",
                },
              ],
            },
          ],
        },
        {
          number: "3",
          title: "Acceptable Use of the Platform",
          content: [
            {
              type: "bullet",
              intro:
                "Users must use the Platform only for lawful purposes and in accordance with these Terms and all applicable laws and regulations. Users shall not use the Platform in any manner that may interfere with its operation, compromise its security, infringe the rights of others, or otherwise misuse the Platform. Without limitation, Users MUST NOT:",
              items: [
                "Engage in any fraudulent, illegal, deceptive, or unauthorized activity, including using stolen or unauthorized payment methods, impersonating another person or entity, engaging in money laundering, ticket scalping where prohibited by applicable law, or otherwise violating any applicable laws or regulations.",
                "Upload, publish, transmit, or distribute any Content that is unlawful, defamatory, discriminatory, fraudulent, misleading, obscene, malicious, or otherwise infringes the intellectual property rights, privacy rights, or other legal rights of any person or entity.",
                "Use the Platform to distribute spam, unsolicited commercial communications, fraudulent advertisements, unauthorized marketing materials, pyramid schemes, or any other abusive or disruptive communications.",
                "Attempt to gain unauthorized access to the Platform, its systems, networks, databases, user accounts, payment systems, or confidential information. Users must not engage in hacking, phishing, password harvesting, malware distribution, or any activity that may compromise the security, integrity, or availability of the Platform or the personal data of other Users.",
              ],
            },
          ],
        },
        {
          number: "4",
          title: "Content and Intellectual Property",
          subsections: [
            {
              number: "4.1",
              title: "Ownership of Platform Content",
              content: [
                {
                  type: "text",
                  body: 'The Platform and all content, materials, software, technology, features, functionalities, designs, layouts, graphics, logos, trademarks, databases, text, images, videos, source code, and other proprietary materials created, owned, or licensed by ExeCorner ("Platform Content") are and shall remain the exclusive property of ExeCorner or its licensors and are protected by applicable intellectual property and other proprietary rights.',
                },
                {
                  type: "text",
                  body: "Nothing contained in these Terms or your use of the Platform grants or shall be construed as granting you any ownership, license, or other proprietary interest in the Platform Content, except for the limited right to access and use the Platform in accordance with these Terms.",
                },
                {
                  type: "text",
                  body: "Except as expressly authorized in writing by ExeCorner or permitted by applicable law, you shall not copy, reproduce, modify, distribute, publish, display, transmit, sell, license, sublicense, reverse engineer, decompile, create derivative works from, exploit, or otherwise use any Platform Content for any purpose.",
                },
              ],
            },
            {
              number: "4.2",
              title: "Provider Content",
              content: [
                {
                  type: "text",
                  body: 'Providers retain ownership of all intellectual property rights in the content they submit, upload, publish, or otherwise make available through the Platform, including event descriptions, course materials, presentations, recordings, trademarks, logos, certifications, images, videos, and other proprietary materials ("Provider Content").',
                },
                {
                  type: "text",
                  body: "By making Provider Content available through the Platform, each Provider grants ExeCorner a non-exclusive, worldwide, royalty-free, transferable, sublicensable license to host, reproduce, display, publish, distribute, modify solely for technical or formatting purposes, and otherwise use such Provider Content as reasonably necessary to operate, maintain, promote, market, improve, and provide the Platform and its Services.",
                },
              ],
            },
            {
              number: "4.3",
              title: "User Generated Content",
              content: [
                {
                  type: "text",
                  body: 'The Platform may allow Users to submit, upload, publish, or otherwise make available reviews, ratings, comments, articles, images, videos, or other content ("User Content").',
                },
                {
                  type: "bullet",
                  intro:
                    "By submitting any User Content, you represent and warrant that:",
                  items: [
                    "you own or otherwise possess all necessary rights, licenses, permissions, and authorizations to submit such User Content;",
                    "your User Content does not infringe any intellectual property, privacy, publicity, confidentiality, or other legal rights of any third party; and",
                    "your User Content complies with these Terms and all applicable laws.",
                  ],
                },
                {
                  type: "text",
                  body: "You grant ExeCorner a perpetual (to the extent permitted by applicable law), worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, store, reproduce, modify solely for technical purposes, display, publish, distribute, and otherwise use your User Content for the operation, maintenance, promotion, and improvement of the Platform.",
                },
              ],
            },
            {
              number: "4.4",
              title: "Intellectual Property Restrictions",
              content: [
                {
                  type: "text",
                  body: "Users and Providers shall respect all intellectual property rights relating to the Platform, Platform Content, Provider Content, and User Content.",
                },
                {
                  type: "text",
                  body: "Without the prior written authorization of the applicable rights holder, you shall not record, reproduce, download, copy, distribute, publish, display, transmit, sell, sublicense, commercialize, or otherwise exploit any copyrighted or proprietary materials made available through the Platform, including any course materials, presentations, training materials, event recordings, certifications, software, documents, or other protected content.",
                },
                {
                  type: "text",
                  body: "Any unauthorized use, reproduction, distribution, disclosure, or exploitation of any intellectual property made available through the Platform may result in the immediate suspension or termination of your Account, removal of the infringing content, and the pursuit of any civil, criminal, or other legal remedies available under applicable law.",
                },
              ],
            },
          ],
        },
        {
          number: "5",
          title: "Payments",
          subsections: [
            {
              number: "5.1",
              title: "Payment Framework",
              content: [
                {
                  type: "text",
                  body: "Creating and maintaining an Account on the Platform is free of charge. However, certain courses, events, certifications, coaching programs, networking events, or other Services offered through the Platform may require payment, as determined solely by the relevant Provider. Payments for Services listed on the Platform may be made either directly to the relevant Provider or, where available, through the Platform's designated payment gateway or payment service providers. Where ExeCorner facilitates payment processing, ExeCorner acts solely as a technology intermediary and payment facilitator and is not a party to the underlying agreement or transaction between the User and the Provider.",
                },
              ],
            },
            {
              number: "5.2",
              title: "Third-Party Payment Services",
              content: [
                {
                  type: "text",
                  body: "The Platform may utilize independent third-party payment service providers to process transactions. Any payment processed through such providers may also be subject to the applicable terms and conditions and privacy policies of the relevant payment service provider. ExeCorner is not responsible for any errors, delays, interruptions, failures, or other issues arising from the services of any third-party payment service provider.",
                },
              ],
            },
            {
              number: "5.3",
              title: "Cancellations and Refunds",
              content: [
                {
                  type: "text",
                  body: "By completing a purchase for any training, seminar, workshop, or coaching program on the ExeCorner platform, the User explicitly agrees to be bound by these Specific Terms and Conditions for Refund.",
                },
              ],
              subsections: [
                {
                  number: "5.3.1",
                  title: "Criteria For Refund Validity",
                  content: [
                    {
                      type: "bullet",
                      intro:
                        "A refund request shall only be deemed valid, processed, and enforceable if it meets all of the following cumulative conditions:",
                      items: [
                        "Non-Occurrence of the Event: A refund shall only be initiated if the scheduled event does not take place, is cancelled, or is indefinitely postponed by the Provider. No refunds shall be issued for User absenteeism, scheduling conflicts, personal emergencies, or unilateral changes of mind on the part of the User.",
                        "Exclusive Use of Platform Payment Gateway: A refund shall only be processed for transactions successfully executed through the official integrated ExeCorner Payment Gateway (including but not limited to integrated Virtual Accounts, Credit Cards, E-Wallets, and QRIS). Any off-platform transactions, direct bank transfers to Provider, or cash payments bypass our IT ecosystem and are strictly ineligible for platform-mediated refunds.",
                      ],
                    },
                  ],
                },
                {
                  number: "5.3.2",
                  title: "Important Timeframes",
                  content: [
                    {
                      type: "bullet",
                      intro:
                        "The processing of valid refunds is strictly governed by a two-tiered transactional window:",
                      items: [
                        "Request Window (H+7 Limit): The User must formally submit their refund request through the platform dashboard within a maximum of 7 (seven) calendar days after the scheduled date of the cancelled event (H+7). Failure to request a refund within this H+7 window shall result in an absolute waiver of the refund right, and the underlying funds shall be reconciled according to standard platform-partner bilateral agreements.",
                        "Settlement Window (Maximum H+21 Process): Once a valid refund request is submitted within the allowed timeframe, ExeCorner shall execute the fund transfer back to the User's designated bank account within a maximum of 21 (twenty-one) calendar days from the exact date the refund request was made.",
                      ],
                    },
                  ],
                },
                {
                  number: "5.3.3",
                  title: "Financial Disclaimers and Non-Refundable Fees",
                  content: [
                    {
                      type: "bullet",
                      items: [
                        "Principal Amount: The refundable amount is strictly limited to the net ticket price or registration fee paid by the User for the cancelled event.",
                        "Payment Gateway Processing Fees: The User acknowledges and agrees that platform administrative fees, third-party payment gateway processing fees, and interbank transfer charges are non-refundable, as these represent digital infrastructure utilization costs incurred at the time of the initial transaction.",
                        "Indirect, incidental, or consequential fee: ExeCorner operates purely as a commercial marketplace platform facilitating connections between Users and trusted professional network Partners. Consequently, ExeCorner and its parent network, MSW Global, are fully indemnified against any claims for indirect, incidental, or consequential damages, including but not limited to travel expenses, accommodation costs, or loss of professional time arising from a Partner's failure to host an event.",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          number: "6",
          title: "Privacy and Data Protection",
          content: [
            {
              type: "text",
              body: "ExeCorner recognizes the importance of protecting the privacy and security of personal data and is committed to implementing and maintaining appropriate administrative, technical, organizational, and physical safeguards designed to protect personal data from unauthorized access, use, disclosure, alteration, loss, misuse, or destruction.",
            },
            {
              type: "text",
              body: "The collection, use, processing, storage, disclosure, and protection of personal data are governed by our Privacy Policy, which forms an integral part of these Terms. By accessing or using the Platform, you acknowledge that you have read and understood the Privacy Policy and consent to the processing of your personal data in accordance with the Privacy Policy and applicable laws.",
            },
            {
              type: "text",
              body: "Users are responsible for ensuring that the information they provide through the Platform is accurate, complete, and up to date. Where a User provides personal data relating to another individual, the User represents and warrants that all necessary authority or consent has been obtained in accordance with applicable laws.",
            },
          ],
        },
        {
          number: "7",
          title: "Enforcement Actions",
          subsections: [
            {
              number: "7.1",
              title: "Suspension or Restriction of Access",
              content: [
                {
                  type: "bullet",
                  intro:
                    "ExeCorner reserves the right, at its sole discretion and without prior notice where reasonably necessary, to suspend, restrict, or temporarily disable your access to the Platform, your Account, or any Content or listing associated with your Account if ExeCorner reasonably determines that:",
                  items: [
                    "you have violated or are suspected of violating these Terms or any applicable laws or regulations;",
                    "you have engaged in fraudulent, deceptive, unlawful, or unauthorized activities;",
                    "your use of the Platform poses a security, legal, operational, or reputational risk to ExeCorner, the Platform, or any User or Provider;",
                    "your Account has been compromised or is reasonably suspected of unauthorized use; or",
                    "such action is necessary to protect the integrity, security, functionality, or lawful operation of the Platform.",
                  ],
                },
              ],
            },
            {
              number: "7.2",
              title: "Account Termination",
              content: [
                {
                  type: "bullet",
                  intro:
                    "ExeCorner reserves the right to terminate your Account, remove your access to the Platform, or permanently remove any Content, listings, courses, events, or services associated with your Account if:",
                  items: [
                    "you commit a material or repeated breach of these Terms;",
                    "you engage in fraud, intellectual property infringement, illegal activities, or any conduct that may expose ExeCorner or other Users to legal, financial, operational, or reputational risk;",
                    "you provide false, misleading, or inaccurate information;",
                    "your continued use of the Platform is no longer considered appropriate or lawful under applicable laws or these Terms; or",
                    "ExeCorner is required to do so by applicable law, a competent authority, or a court or arbitral tribunal with appropriate jurisdiction.",
                  ],
                  outro:
                    "Termination may occur immediately where ExeCorner reasonably determines that such action is necessary to protect the Platform, its Users, Providers, or legitimate business interests.",
                },
              ],
            },
            {
              number: "7.3",
              title: "Consequences of Termination",
              content: [
                {
                  type: "bullet",
                  intro: "Upon suspension or termination:",
                  items: [
                    "your right to access or use the Platform shall immediately cease to the extent specified by ExeCorner;",
                    "ExeCorner may remove, disable, or restrict access to your Account, listings, User Content, or other materials associated with your Account;",
                    "any outstanding rights, obligations, liabilities, payment obligations, indemnities, intellectual property rights, dispute resolution provisions, or other provisions that by their nature are intended to survive shall remain in full force and effect; and",
                    "ExeCorner shall not be liable for any loss, damage, loss of profits, business interruption, or other consequences arising from any suspension or termination carried out in accordance with these Terms.",
                  ],
                },
              ],
            },
            {
              number: "7.4",
              title: "User-Initiated Account Closure",
              content: [
                {
                  type: "text",
                  body: "You may discontinue your use of the Platform and request the closure of your Account at any time, subject to the completion of any outstanding transactions, contractual obligations, payment obligations, or other legal responsibilities existing prior to the effective date of such closure.",
                },
              ],
            },
          ],
        },
        {
          number: "8",
          title: "Limitation of Liability",
          subsections: [
            {
              number: "8.1",
              title: "Limitation of Liability for Partner Services",
              content: [
                {
                  type: "bullet",
                  intro:
                    "To the fullest extent permitted by applicable law, ExeCorner and PT. MSW Global Solusi shall not be liable for any direct, indirect, incidental, consequential, special, or punitive losses, damages, claims, costs, or expenses arising out of or relating to:",
                  items: [
                    "your access to or use of the Platform;",
                    "any services, events, courses, certifications, products, or other offerings provided by a Provider;",
                    "any inaccuracies, omissions, delays, interruptions, or unavailability of the Platform or its Content; or",
                    "any dispute or transaction between a User and a Provider.",
                  ],
                  outro:
                    "Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable law.",
                },
              ],
            },
            {
              number: "8.2",
              title: "No Warranty",
              content: [
                {
                  type: "text",
                  body: 'The Platform and all Content made available through it are provided on an "as is" and "as available" basis. While ExeCorner endeavors to keep information accurate and up to date, ExeCorner does not warrant that the Platform, its Content, or any information provided by a Provider will be complete, accurate, reliable, current, uninterrupted, secure, or error-free. Any articles, insights, educational materials, event information, or other Content made available through the Platform are provided for general informational purposes only and do not constitute professional, legal, financial, tax, investment, or other professional advice.',
                },
              ],
            },
          ],
        },
        {
          number: "9",
          title: "Force Majeure",
          subsections: [
            {
              number: "9.1",
              title: "Force Majeure Events",
              content: [
                {
                  type: "text",
                  body: 'ExeCorner shall not be liable for any delay, interruption, suspension, or failure to perform any obligation under these Terms to the extent such delay, interruption, suspension, or failure results from events or circumstances beyond its reasonable control, including but not limited to natural disasters, floods, earthquakes, fires, pandemics, epidemics, war, terrorism, civil unrest, labor disputes, strikes, government actions, changes in applicable laws or regulations, embargoes, sanctions, power outages, internet or telecommunications failures, cyberattacks, failures of third-party service providers, payment service providers, hosting providers, or any other event of a similar nature beyond ExeCorner\'s reasonable control (each, a "Force Majeure Event").',
                },
              ],
            },
            {
              number: "9.2",
              title: "Effect of Force Majeure",
              content: [
                {
                  type: "text",
                  body: "During the occurrence of a Force Majeure Event, ExeCorner may, without incurring any liability, suspend, restrict, postpone, modify, or discontinue all or any part of the Platform or its Services to the extent reasonably necessary. ExeCorner shall also not be responsible or liable for any cancellation, postponement, interruption, modification, delay, or other disruption of any course, event, conference, certification, coaching program, networking event, or other services offered through the Platform where such disruption is caused directly or indirectly by a Force Majeure Event affecting ExeCorner, the relevant Provider, or any third-party service provider.",
                },
              ],
            },
          ],
        },
        {
          number: "10",
          title: "Changes to the Terms",
          content: [
            {
              type: "text",
              body: "ExeCorner reserves the right to amend, modify, or update these Terms at any time. Any revised Terms shall become effective immediately upon publication on the Platform, unless otherwise specified. By continuing to access or use the Platform after the revised Terms become effective, you acknowledge and agree to be bound by the updated Terms.",
            },
          ],
        },
        {
          number: "11",
          title: "Governing Law and Dispute Resolution",
          subsections: [
            {
              number: "11.1",
              title: "Governing Law",
              content: [
                {
                  type: "text",
                  body: "These Terms, and any dispute, controversy, or claim arising out of or relating to these Terms or the use of the Platform, shall be governed by and construed in accordance with the laws of the Republic of Indonesia.",
                },
              ],
            },
            {
              number: "11.2",
              title: "Dispute Resolution",
              content: [
                {
                  type: "text",
                  body: "Any dispute arising out of or relating to these Terms or your use of the Platform shall first be resolved through good faith negotiations between the parties. If the dispute cannot be resolved through negotiation within thirty (30) days, it shall be finally settled by arbitration administered by Badan Arbitrase Nasional Indonesia (BANI) in accordance with its applicable rules.",
                },
              ],
            },
          ],
        },
        {
          number: "12",
          title: "Contact Information",
          content: [
            {
              type: "text",
              body: "If you have any questions, comments, or concerns regarding these Terms or your use of the Platform, please contact ExeCorner using the following details: Email: info@executivecorner.id, Telephone: (+62) 21 5890 5593. By using ExeCorner, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.",
            },
          ],
        },
      ],
    },
    {
      part: "PART II",
      title: "Additional Terms for Users",
      sections: [
        {
          number: "1",
          title: "Booking & Registration",
          content: [
            {
              type: "text",
              body: "Users may browse, register for, purchase, or otherwise participate in Services offered by Providers through the Platform. Users are responsible for reviewing the details of each Service, including the schedule, fees, eligibility requirements, cancellation policy, refund policy, and any other applicable terms established by the relevant Provider before completing any booking or purchase. A booking or registration shall only be considered confirmed upon successful completion of any applicable registration requirements and, where applicable, receipt of full payment.",
            },
          ],
        },
        {
          number: "2",
          title: "Payments by Users",
          content: [
            {
              type: "text",
              body: "Where payment is required, Users agree to pay all applicable fees, charges, taxes, and other amounts associated with the selected Services using the payment methods made available through the Platform or otherwise designated by the relevant Provider. Users are responsible for ensuring that all payment information provided is accurate, complete, and up to date, and that sufficient funds or available credit are maintained to complete each transaction. Failure to complete payment may result in cancellation of the booking or denial of access to the relevant Service.",
            },
          ],
        },
        {
          number: "3",
          title: "Cancellation and Refunds",
          content: [
            {
              type: "text",
              body: "Users acknowledge that cancellation and refund policies are determined solely by the relevant Provider unless otherwise expressly stated on the Platform. Users are responsible for reviewing the applicable cancellation and refund policy before completing any booking or purchase. Any request for cancellation or refund must be submitted in accordance with the relevant Provider's policies and procedures.",
            },
          ],
        },
        {
          number: "4",
          title: "Participation in Services",
          content: [
            {
              type: "text",
              body: "Users are responsible for complying with any requirements, rules, instructions, or codes of conduct established by the relevant Provider in relation to any Service. Users acknowledge that participation in any course, seminar, workshop, conference, certification, coaching session, networking event, webinar, or other Service is at their own discretion and responsibility.",
            },
          ],
        },
        {
          number: "5",
          title: "Reviews and Feedback",
          content: [
            {
              type: "text",
              body: "Where the Platform permits Users to submit ratings, reviews, comments, or other feedback, such content must be accurate, genuine, respectful, and based on the User's actual experience. Users must not submit any content that is false, misleading, defamatory, abusive, discriminatory, unlawful, or otherwise violates these Terms or applicable laws. ExeCorner reserves the right, but not the obligation, to remove or restrict any review or feedback that it reasonably considers inappropriate or inconsistent with these Terms.",
            },
          ],
        },
        {
          number: "6",
          title: "User Acknowledgement",
          content: [
            {
              type: "text",
              body: "Users acknowledge and agree that ExeCorner acts solely as a technology platform facilitating connections between Users and independent Providers. Users further acknowledge that the relevant Provider is solely responsible for the quality, legality, accuracy, scheduling, delivery, cancellation, certification, and overall performance of the Services offered through the Platform.",
            },
          ],
        },
      ],
    },

    {
      part: "PART III",
      title: "Additional Terms for Providers",
      sections: [
        {
          number: "1",
          title: "Provider Eligibility",
          content: [
            {
              type: "bullet",
              intro:
                "To list or offer any Service through the Platform, a Provider represents and warrants that it:",
              items: [
                "possesses the legal capacity and authority to enter into these Terms;",
                "holds all licenses, permits, approvals, certifications, accreditations, or other authorizations required under applicable laws to provide its Services;",
                "will maintain such qualifications throughout the period its Services remain available on the Platform; and",
                "will promptly notify ExeCorner of any circumstance that may affect its eligibility to provide the Services.",
              ],
            },
          ],
        },
        {
          number: "2",
          title: "Provider Listings",
          content: [
            {
              type: "bullet",
              intro:
                "Providers are solely responsible for ensuring that all information submitted to or displayed on the Platform is accurate, complete, current, lawful, and not misleading. This includes, without limitation:",
              items: [
                "Service descriptions;",
                "schedules and venues;",
                "pricing;",
                "trainer, speaker, or facilitator information;",
                "prerequisites;",
                "certificates or qualifications offered;",
                "promotional materials; and",
                "any other information relating to the Services.",
              ],
              outro:
                "Providers shall promptly update any inaccurate or outdated information.",
            },
          ],
        },
        {
          number: "3",
          title: "Provider Responsibilities",
          content: [
            {
              type: "bullet",
              intro: "Providers are solely responsible for:",
              items: [
                "organizing and delivering their Services;",
                "ensuring the quality and legality of their Services;",
                "ensuring that trainers, speakers, facilitators, or instructors possess appropriate qualifications;",
                "complying with all applicable laws and regulations;",
                "issuing certificates or other deliverables where applicable;",
                "responding to User inquiries and complaints relating to their Services; and",
                "fulfilling all obligations communicated to Users through the Platform.",
              ],
            },
          ],
        },
        {
          number: "4",
          title: "Pricing, Payments, and Settlement",
          content: [
            {
              type: "text",
              body: "Providers are solely responsible for determining the pricing of their Services.",
            },
            {
              type: "bullet",
              intro:
                "Where a Provider elects to process payments through ExeCorner's designated payment gateway, the Provider agrees that:",
              items: [
                "ExeCorner shall be entitled to deduct a platform commission of fifteen percent (15%) of the total transaction value unless otherwise agreed in writing;",
                "payment settlements shall be remitted to the Provider within seven (7) calendar days after completion of the relevant Service or Event, after deduction of applicable commissions, payment gateway fees, taxes, or other agreed deductions; and",
                "ExeCorner may temporarily withhold settlement where reasonably necessary to investigate suspected fraud, payment disputes, technical issues, or legal compliance matters.",
              ],
              outro:
                "Where the Provider independently processes payments through its own payment methods or payment gateway, no platform commission shall be payable to ExeCorner unless otherwise agreed in writing.",
            },
          ],
        },
        {
          number: "5",
          title: "Cancellation and Refund Obligations",
          content: [
            {
              type: "text",
              body: "Providers are solely responsible for establishing, maintaining, and communicating their cancellation and refund policies. Where a cancellation, postponement, rescheduling, or refund is required, the Provider shall remain solely responsible for processing and funding any applicable refund, credit, reimbursement, or other financial remedy unless otherwise agreed in writing with ExeCorner. Providers shall ensure that all cancellation and refund policies comply with applicable laws.",
            },
          ],
        },
        {
          number: "6",
          title: "Marketing and Promotional License",
          content: [
            {
              type: "text",
              body: "Providers grant ExeCorner a non-exclusive, worldwide, royalty-free license to use, reproduce, publish, display, distribute, and otherwise use the Provider's business name, trademarks, logos, event information, promotional materials, and other content solely for the purpose of operating, promoting, and marketing the Platform and the Provider's Services. This license shall automatically terminate upon removal of the relevant Services from the Platform, except where continued use is reasonably necessary for legal, operational, or archival purposes.",
            },
          ],
        },
        {
          number: "7",
          title: "Provider Representations and Warranties",
          content: [
            {
              type: "bullet",
              intro: "Each Provider represents and warrants that:",
              items: [
                "all information provided through the Platform is true, accurate, complete, and not misleading;",
                "it owns or has obtained all necessary rights, licenses, permissions, and authorizations relating to its Services and Provider Content;",
                "its Services do not infringe the intellectual property or other legal rights of any third party;",
                "it will not engage in fraudulent, deceptive, misleading, or unlawful conduct; and",
                "it will continuously comply with these Terms and all applicable laws.",
              ],
            },
          ],
        },
        {
          number: "8",
          title: "Suspension or Removal of Listings",
          content: [
            {
              type: "bullet",
              intro:
                "Without limiting any other rights available under these Terms, ExeCorner may suspend, remove, restrict, or disable any Provider listing or Service where ExeCorner reasonably believes that:",
              items: [
                "these Terms have been violated;",
                "any listing contains inaccurate, misleading, or unlawful information;",
                "the Provider's conduct may expose Users or ExeCorner to legal, financial, operational, or reputational risks; or",
                "such action is required by applicable law or a competent authority.",
              ],
            },
          ],
        },
        {
          number: "8",
          title: "Provider Liability",
          content: [
            {
              type: "bullet",
              intro:
                "Providers acknowledge and agree that they are solely responsible for:",
              items: [
                "the organization and delivery of their Services;",
                "cancellations, postponements, or modifications of any Service;",
                "communications with Users;",
                "all transactions entered into with Users; and",
                "any losses, claims, complaints, liabilities, or disputes arising from their Services.",
              ],
              outro:
                "Where a Provider fails to deliver a Service, cancels a Service, removes a listing after bookings have been made, or otherwise breaches its obligations to Users, the Provider shall remain solely responsible for resolving the matter and fulfilling any resulting legal or financial obligations.",
            },
          ],
        },
        {
          number: "9",
          title: "ExeCorner's Role in User-Provider Disputes",
          content: [
            {
              type: "text",
              body: "ExeCorner acts solely as a technology platform facilitating connections between Users and Providers and does not supervise, control, manage, or guarantee the Provider's business operations or the delivery of its Services. Providers acknowledge and agree that they remain solely responsible for the listing, pricing, organization, delivery, modification, cancellation, refunds, and overall performance of their Services, as well as for fulfilling all contractual obligations owed to Users. Accordingly, ExeCorner shall not be responsible or liable for resolving any disputes arising between a User and a Provider, including but not limited to disputes relating to the quality of Services, cancellations, refunds, payment disputes, attendance, certifications, or any contractual obligations between the parties. Where appropriate, ExeCorner may, at its sole discretion, facilitate communication between Users and Providers in an effort to assist them in reaching an amicable resolution. Any such assistance is provided solely as a mediator and communication facilitator and shall not create any obligation for ExeCorner to investigate claims, determine liability, provide refunds or compensation, or otherwise assume any legal or financial responsibility arising out of or relating to the Provider's Services.",
            },
          ],
        },
        {
          number: "10",
          title: "Provider Indemnity",
          content: [
            {
              type: "bullet",
              intro:
                "Providers agree to defend, indemnify, and hold harmless ExeCorner, PT. MSW Global Solusi, its affiliates, directors, officers, employees, and representatives from and against any claims, liabilities, damages, losses, costs, expenses, penalties, or legal fees arising out of or relating to:",
              items: [
                "the Provider's Services;",
                "any breach of these Terms;",
                "any violation of applicable laws or regulations;",
                "any infringement of intellectual property or other rights of third parties;",
                "any negligent, fraudulent, misleading, or wrongful act or omission of the Provider; or",
                "any claim brought by a User relating to the Provider's Services.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
