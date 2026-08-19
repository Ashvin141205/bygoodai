import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import VerificationBg from '../assets/image/blogBg.png';

const CompanyVerification = () => {
    const canonicalUrl = "https://www.luckycharmsweep.com/company-verification";
    
    return (
        <>
            <Helmet>
                <title>Company Verification - Lucky Charm LLC | Registered Business</title>
                <meta name="description" content="Verify Lucky Charm LLC registration details, security certifications, and business legitimacy. Transparent information about our registered company." />
                <link rel="canonical" href={canonicalUrl} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Hero title="Company Verification" bgImg={VerificationBg} backgroundColor='#290A47' />

            <div className="bg-[#1A202C] min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    
                    {/* Company Registration Section */}
                    <section className="bg-[#290A47] p-8 rounded-lg border-2 border-[#FFDD15] mb-8">
                        <div className="flex items-center mb-6">
                            <div className="bg-[#FFDD15] rounded-full p-3 mr-4">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Registered Business Entity</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 text-white">
                            <div className="bg-black/30 p-4 rounded">
                                <p className="text-[#CACACA] text-sm mb-1">Legal Name</p>
                                <p className="text-xl font-semibold">Lucky Charm LLC</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded">
                                <p className="text-[#CACACA] text-sm mb-1">Employer Identification Number (EIN)</p>
                                <p className="text-xl font-semibold">14-7C</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded">
                                <p className="text-[#CACACA] text-sm mb-1">Year Established</p>
                                <p className="text-xl font-semibold">2024</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded">
                                <p className="text-[#CACACA] text-sm mb-1">Business Type</p>
                                <p className="text-xl font-semibold">Limited Liability Company</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded">
                            <p className="text-green-400 flex items-center">
                                <span className="text-2xl mr-2">✓</span>
                                <span className="font-semibold">Verified Registered Business</span>
                            </p>
                            <p className="text-sm text-[#CACACA] mt-2">
                                Lucky Charm LLC is a legally registered business entity with a valid Employer Identification Number (EIN) issued by the IRS.
                            </p>
                        </div>
                    </section>

                    {/* What We Do Section */}
                    <section className="bg-[#290A47] p-8 rounded-lg border-2 border-[#EC29FC] mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Our Business Model</h2>
                        <div className="space-y-4 text-white">
                            <div className="flex items-start">
                                <span className="text-[#FFDD15] text-2xl mr-3">→</span>
                                <div>
                                    <h3 className="font-semibold mb-1">Platform Aggregator Service</h3>
                                    <p className="text-[#CACACA] text-sm">
                                        We provide a convenient platform for users to access multiple licensed gaming platforms through a single account management system.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-[#FFDD15] text-2xl mr-3">→</span>
                                <div>
                                    <h3 className="font-semibold mb-1">Payment Facilitation</h3>
                                    <p className="text-[#CACACA] text-sm">
                                        We facilitate secure deposits and withdrawals for users accessing third-party licensed gaming platforms.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-[#FFDD15] text-2xl mr-3">→</span>
                                <div>
                                    <h3 className="font-semibold mb-1">Customer Support Services</h3>
                                    <p className="text-[#CACACA] text-sm">
                                        We provide 24/7 customer support to help users navigate gaming platforms, manage accounts, and resolve transaction issues.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded">
                            <p className="text-blue-400 font-semibold mb-2">Important Note:</p>
                            <p className="text-sm text-[#CACACA]">
                                Lucky Charm LLC <strong>does not operate, own, or host any casino games</strong>. We serve as an intermediary service connecting users to independently licensed gaming platforms. Each gaming platform operates under its own gaming license and jurisdiction.
                            </p>
                        </div>
                    </section>

                    {/* Security & Trust Section */}
                    <section className="bg-[#290A47] p-8 rounded-lg border-2 border-green-500 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Security & Trust Measures</h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-6 rounded">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-500 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-semibold">SSL Encryption</h3>
                                </div>
                                <p className="text-[#CACACA] text-sm">
                                    All data transmitted through our platform is protected with 256-bit SSL encryption, the same security used by banks.
                                </p>
                            </div>

                            <div className="bg-black/30 p-6 rounded">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-500 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-semibold">Secure Payments</h3>
                                </div>
                                <p className="text-[#CACACA] text-sm">
                                    We partner with trusted payment processors including PayPal, major credit cards, and established cryptocurrency networks.
                                </p>
                            </div>

                            <div className="bg-black/30 p-6 rounded">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-500 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-semibold">Identity Verification</h3>
                                </div>
                                <p className="text-[#CACACA] text-sm">
                                    We use Veriff.com for KYC (Know Your Customer) verification to ensure age compliance and prevent fraud.
                                </p>
                            </div>

                            <div className="bg-black/30 p-6 rounded">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-500 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-semibold">24/7 Support</h3>
                                </div>
                                <p className="text-[#CACACA] text-sm">
                                    Our customer support team is available around the clock to address concerns and resolve issues promptly.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Transparency Section */}
                    <section className="bg-[#290A47] p-8 rounded-lg border-2 border-[#FFDD15] mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Our Commitment to Transparency</h2>
                        
                        <div className="space-y-4 text-white">
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3">✓</span>
                                <p className="text-[#CACACA]">
                                    <strong className="text-white">Clear Business Model:</strong> We openly state that we are a service platform, not a gaming operator.
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3">✓</span>
                                <p className="text-[#CACACA]">
                                    <strong className="text-white">Verified Registration:</strong> Our EIN and company registration are publicly verifiable through official channels.
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3">✓</span>
                                <p className="text-[#CACACA]">
                                    <strong className="text-white">Clear Terms:</strong> We provide detailed Terms of Service and Privacy Policy outlining our services and user rights.
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3">✓</span>
                                <p className="text-[#CACACA]">
                                    <strong className="text-white">Age Restriction:</strong> We strictly enforce 21+ age requirements and use third-party verification.
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3">✓</span>
                                <p className="text-[#CACACA]">
                                    <strong className="text-white">Contact Information:</strong> We provide multiple ways to reach us including phone, email, and support forms.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact & Support */}
                    <section className="bg-[#290A47] p-8 rounded-lg border-2 border-[#EC29FC]">
                        <h2 className="text-2xl font-bold text-white mb-6">Questions or Concerns?</h2>
                        <p className="text-[#CACACA] mb-6">
                            If you have questions about our company registration, business model, or security measures, our support team is here to help.
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-black/30 p-4 rounded text-center">
                                <p className="text-[#FFDD15] font-semibold mb-2">📞 Phone Support</p>
                                <p className="text-white">+1 (318) 374-1164</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded text-center">
                                <p className="text-[#FFDD15] font-semibold mb-2">📧 Email</p>
                                <p className="text-white">info@luckycharmsweep.com</p>
                            </div>
                            
                            <div className="bg-black/30 p-4 rounded text-center">
                                <p className="text-[#FFDD15] font-semibold mb-2">💬 Live Support</p>
                                <a href="/support" className="text-white hover:text-[#FFDD15]">Contact Form</a>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
};

export default CompanyVerification;
