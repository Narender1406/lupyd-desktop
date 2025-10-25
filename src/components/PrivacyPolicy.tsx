import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collection", title: "Information We Collect" },
    { id: "information-use", title: "How We Use Your Information" },
    { id: "information-sharing", title: "Information Sharing" },
    { id: "data-security", title: "Data Security" },
    { id: "user-rights", title: "Your Rights" },
    { id: "cookies", title: "Cookies & Tracking Technologies" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "children", title: "Children's Privacy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-700 sticky top-0 z-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Lupyd
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-sm font-semibold text-white"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            At Lupyd, we believe in transparency and protecting your privacy. This policy explains how we collect, use,
            and safeguard your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: October 2025</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Contents</h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSection === section.id
                      ? "bg-white text-black font-semibold"
                      : "text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{section.title}</span>
                    {activeSection === section.id && <ChevronRight size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12 text-gray-300">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Introduction</h2>
              <p className="mb-2">
                Welcome to Lupyd ("we," "us," "our," or "Company"). Lupyd is committed to protecting your privacy and
                ensuring you have a positive experience on our platform. This Privacy Policy explains our online
                information practices and the choices you can make about how your information is collected and used.
              </p>
              <p>
                This Privacy Policy applies to information we collect through our website, mobile application, and all
                related services (collectively, the "Service"). Please read this policy carefully. If you do not agree
                with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="information-collection" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-2">Information You Provide Directly</h3>
              <ul className="list-disc list-inside mb-4">
                <li>Account registration information (name, email, phone number, profile picture)</li>
                <li>Profile information and biographical data</li>
                <li>Content you create, upload, or share (posts, comments, messages)</li>
                <li>Payment and billing information</li>
                <li>Customer support communications</li>
                <li>Preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">Information Collected Automatically</h3>
              <ul className="list-disc list-inside">
                <li>Device information (type, operating system, unique identifiers)</li>
                <li>Log data (IP address, access times, pages viewed)</li>
                <li>Location information (with your permission)</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* Information Use */}
            <section id="information-use" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing transactions and sending related information</li>
                <li>Sending promotional communications (with your consent)</li>
                <li>Responding to your inquiries and providing customer support</li>
                <li>Personalizing your experience and content recommendations</li>
                <li>Analyzing usage patterns to improve our platform</li>
                <li>Detecting and preventing fraud and security issues</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section id="information-sharing" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Information Sharing</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Service Providers:</strong> With vendors who assist us in operating our website and conducting our business</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                <li><strong>Public Content:</strong> Information you choose to make public on your profile</li>
              </ul>
            </section>

            {/* Data Security */}
            <section id="data-security" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Data Security</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication protocols</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and employee training</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mt-2">While we strive to protect your information, no security system is impenetrable. We cannot guarantee absolute security of your data.</p>
            </section>

            {/* User Rights */}
            <section id="user-rights" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Your Rights</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Right to Access:</strong> Request a copy of your personal information</li>
                <li><strong>Right to Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
              </ul>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Cookies & Tracking Technologies</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Essential Cookies: Required for basic functionality</li>
                <li>Analytics Cookies: Help us understand how you use our Service</li>
                <li>Preference Cookies: Remember your settings and preferences</li>
                <li>Marketing Cookies: Used for targeted advertising (with consent)</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section id="third-party" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Third-Party Services</h2>
              <p>Our Service may contain links to third-party websites and services that are not operated by Lupyd. This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services before providing your information.</p>
            </section>

            {/* Children's Privacy */}
            <section id="children" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Children's Privacy</h2>
              <p>Lupyd is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information and terminate the child's account.</p>
              <p>For users between 13 and 18, we provide additional privacy protections and limit the collection and use of their information.</p>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <p className="font-semibold">Lupyd Privacy Team</p>

                <a href="mailto:privacy@lupyd.com" className="text-white no-underline hover:no-underline">
                  privacy@lupyd.com
                </a>

                <p className="mt-2 font-semibold">Mailing Address</p>
                <p>
                  Lupyd <br />
                  Khanapuram, Khammam<br />
                </p>
                <p className="mt-2 font-semibold">Response Time</p>
                <p>We aim to respond to all privacy inquiries within 30 days.</p>
              </div>
            </section>

            <section className="border-t border-gray-700 pt-8 mt-12 text-gray-400 text-sm">
              <p>
                This Privacy Policy may be updated from time to
                time. We will notify you of any material changes by posting
                the new Privacy Policy on this page and updating the "Last updated"
                date. Your continued use of the Service following the posting of
                revised Privacy Policy means that you accept and agree to the changes.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
