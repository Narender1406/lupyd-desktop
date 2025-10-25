"use client"

import { useEffect } from "react"

export default function TermsOfUse() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "user-accounts", title: "User Accounts" },
    { id: "acceptable-use", title: "Acceptable Use" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "user-content", title: "User Content" },
    { id: "limitation-liability", title: "Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "termination", title: "Termination" },
    { id: "dispute-resolution", title: "Dispute Resolution" },
    { id: "contact-us", title: "Contact Us" },
  ]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSectionClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Terms of Use</h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
            These Terms of Use govern your access to and use of Lupyd, our website, mobile application, and all related
            services. By using Lupyd, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-400 mt-6">Last updated: October 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-black border-b-2 border-black pb-3">
                Contents
              </h3>
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className="text-sm text-gray-700 hover:text-black transition-colors font-medium text-left w-full"
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <section id="introduction">
              <h2 className="text-3xl font-bold mb-4 text-black">Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Lupyd ("Platform," "we," "us," "our," or "Company"). These Terms of Use ("Terms") constitute
                a legally binding agreement between you and Lupyd regarding your use of our website, mobile application,
                and all related services (collectively, the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing, browsing, or using Lupyd, you acknowledge that you have read, understood, and agree to be
                bound by these Terms. If you do not agree with any part of these Terms, you must not use our Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
                posting to the Service. Your continued use of Lupyd following any modifications constitutes your
                acceptance of the updated Terms.
              </p>
            </section>

            {/* User Accounts */}
            <section id="user-accounts">
              <h2 className="text-3xl font-bold mb-4 text-black">User Accounts</h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-black">Account Creation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use certain features of Lupyd, you must create an account. When creating an account, you agree to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-3 font-bold">•</span>
                    <span>Provide accurate, current, and complete information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold">•</span>
                    <span>Maintain the confidentiality of your password</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold">•</span>
                    <span>Accept responsibility for all activities under your account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold">•</span>
                    <span>Notify us immediately of any unauthorized access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 font-bold">•</span>
                    <span>Be at least 13 years old (18 in some jurisdictions)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-black">Account Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may terminate your account at any time by contacting our support team. Upon termination, your
                  access to the Service will be revoked, though we may retain certain information as required by law.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section id="acceptable-use">
              <h2 className="text-3xl font-bold mb-4 text-black">Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use Lupyd for any unlawful or prohibited purposes. Specifically, you agree not to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Violate any applicable laws, regulations, or third-party rights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Harass, threaten, defame, or abuse other users</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Post or transmit spam, malware, or harmful content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Attempt to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Engage in phishing, fraud, or deceptive practices</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Scrape, crawl, or automate access to the Service</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Interfere with or disrupt the Service or its infrastructure</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>Engage in any form of discrimination or hate speech</span>
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual-property">
              <h2 className="text-3xl font-bold mb-4 text-black">Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on Lupyd, including text, graphics, logos, images, and software, is the property of Lupyd or
                its content suppliers and is protected by international copyright laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are granted a limited, non-exclusive, non-transferable license to access and use the Service for
                personal, non-commercial purposes. You may not reproduce, distribute, modify, or transmit any content
                without our prior written consent.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Lupyd respects intellectual property rights and will respond to valid DMCA notices. If you believe your
                intellectual property has been infringed, please contact us with detailed information.
              </p>
            </section>

            {/* User Content */}
            <section id="user-content">
              <h2 className="text-3xl font-bold mb-4 text-black">User-Generated Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By posting, uploading, or sharing content on Lupyd, you grant us a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, and distribute your content.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">You represent and warrant that:</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>You own or have the right to use the content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>The content does not infringe any third-party rights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>The content complies with all applicable laws</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold">•</span>
                  <span>The content does not contain malware or harmful code</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to remove any content that violates these Terms or our policies.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section id="limitation-liability">
              <h2 className="text-3xl font-bold mb-4 text-black">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUPYD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, EVEN IF ADVISED OF THE
                POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE
                SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100,
                WHICHEVER IS GREATER.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability, so
                some of the above limitations may not apply to you.
              </p>
            </section>

            {/* Indemnification */}
            <section id="indemnification">
              <h2 className="text-3xl font-bold mb-4 text-black">Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Lupyd and its officers, directors, employees, and
                agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from
                or related to your use of the Service, your violation of these Terms, or your infringement of any
                third-party rights.
              </p>
            </section>

            {/* Termination */}
            <section id="termination">
              <h2 className="text-3xl font-bold mb-4 text-black">Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or
                liability, for any reason, including if you breach these Terms or engage in conduct we deem harmful to
                the Service or other users.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. We may retain certain
                information as required by law or for legitimate business purposes.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section id="dispute-resolution">
              <h2 className="text-3xl font-bold mb-4 text-black">Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any dispute arising from or relating to these Terms or your use of Lupyd shall be governed by and
                construed in accordance with the laws of the Indian Judiciary, without regard to its conflict of law
                principles.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You and Lupyd agree to submit to the exclusive jurisdiction of the state and federal courts located in
                New Delhi, India, and waive any objection to venue or inconvenient forum.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Before initiating legal proceedings, you agree to attempt to resolve any dispute through good-faith
                negotiation with our support team.
              </p>
            </section>

            {/* Contact Us */}
            <section id="contact-us" className="border-t-2 border-black pt-8">
              <h2 className="text-3xl font-bold mb-6 text-black">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have questions about these Terms of Use or need to report a violation, please contact us:
              </p>

              <div className="bg-gray-100 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-lg mb-3 text-black">Lupyd Legal Team</h3>
                <p className="text-gray-700 mb-4">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@lupyd.com" className="text-black underline hover:no-underline">
                    support@lupyd.com
                  </a>
                </p>

                <h4 className="font-bold text-sm mb-2 text-black">Mailing Address</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Lupyd 
                  <br>
                  khanapuram
                  </br>
                  khanapuram
                  <br />
                  Khammam,India.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                <strong>Response Time:</strong> We aim to respond to all inquiries within 30 days.
              </p>
            </section>

            {/* Footer Note */}
            <div className="border-t-2 border-black pt-8 mt-8">
              <p className="text-sm text-gray-600 leading-relaxed">
                These Terms of Use may be updated from time to time. We will notify you of any material changes by
                posting the new Terms on this page and updating the "Last updated" date. Your continued use of the
                Service following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 
