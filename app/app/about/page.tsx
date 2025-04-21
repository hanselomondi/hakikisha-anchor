import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between px-5">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
                            Home
                        </Link>
                        <Link href="/sign-up" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
                            Sign Up
                        </Link>
                        <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
                            Login
                        </Link>
                    </nav>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </Button>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-indigo-600 to-indigo-800 py-20">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10"></div>
                    <div className="container relative z-10 flex flex-col items-center text-center">
                        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">About Hakikisha</h1>
                        <p className="mt-6 max-w-2xl text-lg text-indigo-100">
                            Revolutionizing the alcohol supply chain with blockchain verification technology
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16">
                    <div className="container">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Mission</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Hakikisha was founded with a clear mission: to combat counterfeit alcohol products and ensure
                                transparency throughout the supply chain. By leveraging the power of Solana blockchain technology, we
                                provide an immutable record of authenticity that follows each product from manufacturer to consumer.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container px-8">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16">
                            How Hakikisha Works
                        </h2>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="relative pl-16">
                                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
                                    <span className="text-xl font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Product Registration</h3>
                                <p className="text-gray-600">
                                    Manufacturers register their products on the Solana blockchain, creating a unique digital identity for
                                    each item with production details and batch information.
                                </p>
                            </div>

                            <div className="relative pl-16">
                                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
                                    <span className="text-xl font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Supply Chain Tracking</h3>
                                <p className="text-gray-600">
                                    As products move through the supply chain, each transfer is recorded on the blockchain. Retailers
                                    confirm receipt, creating a transparent chain of custody.
                                </p>
                            </div>

                            <div className="relative pl-16">
                                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
                                    <span className="text-xl font-bold">3</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Consumer Verification</h3>
                                <p className="text-gray-600">
                                    Consumers can verify the authenticity of products by scanning a code that reveals the complete
                                    blockchain history, ensuring they're purchasing genuine products.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blockchain Technology Section */}
                <section className="py-16">
                    <div className="container px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                                    Powered by Solana Blockchain
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    We chose Solana for its high-speed, low-cost transactions and environmental efficiency. This allows us
                                    to create a verification system that's both practical and scalable for real-world supply chain
                                    operations.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Immutable records that cannot be altered or forged",
                                        "Fast transaction processing for real-time verification",
                                        "Energy-efficient blockchain technology",
                                        "Low transaction costs for all participants",
                                        "Transparent and auditable supply chain",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-6 w-6 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                                <Image
                                    src="https://www.investopedia.com/thmb/wuuss_5lSKqGckNngtP1__7qEk4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/Blockchain_final-086b5b7b9ef74ecf9f20fe627dba1e34.png"
                                    alt="Blockchain Technology"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container px-8">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-16">
                            Benefits for All Users
                        </h2>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z" />
                                        <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z" />
                                        <line x1="12" x2="12" y1="22" y2="13" />
                                        <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">For Manufacturers</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Protection against counterfeit products</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Brand reputation safeguarding</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Complete visibility of product journey</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Regulatory compliance support</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                                        <path d="M2 7h20" />
                                        <path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
                                        <path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">For Retailers</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Verification of authentic products</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Reduced risk of selling counterfeits</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Enhanced inventory management</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Customer trust and satisfaction</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">For Consumers</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Confidence in product authenticity</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Protection from harmful counterfeits</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Access to product origin information</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>Support for ethical supply chains</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-16">
                    <div className="container">
                        <div className="mx-auto max-w-3xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Meet the Team</h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Hakikisha is a fourth year Computer Science project developed with a strong focus on 
                                user needs and experience. It leverages cutting-edge technologies to promote transparency and efficiency in supply chains.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-1 justify-center w-full ">
                            {[
                                {
                                    name: "Hansel Omondi",
                                    role: "Founder & Lead Developer",
                                    bio: "Software Engineer and Undergraduate student with expertise in Android and Web3 Development",
                                    image: "/Cropped_closeup.jpg"
                                }
                            ].map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="mx-auto h-40 w-40 overflow-hidden rounded-full bg-gray-100 mb-4">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={160}
                                            height={160}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-sm font-medium text-indigo-600">{member.role}</p>
                                    <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-indigo-600 py-16">
                    <div className="container text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            Join the Hakikisha Network
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-indigo-100 mb-8">
                            Be part of the revolution in alcohol supply chain verification. Whether you're a manufacturer, retailer,
                            or interested in our technology, we invite you to join us.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild variant="outline" size="lg" className="border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-700 hover:text-white">
                                <Link href="/sign-up">Sign Up Now</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50">
                <div className="container py-12 px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-indigo-600" />
                                <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                Ensuring authenticity in the alcohol supply chain through Solana blockchain verification.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Links</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-sm text-gray-600 hover:text-indigo-600">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600">
                                        Privacy Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Connect</h3>
                            <div className="mt-4 flex space-x-4">
                                <a href="#" className="text-gray-500 hover:text-indigo-600">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-indigo-600">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <p className="text-center text-xs text-gray-600">
                            &copy; {new Date().getFullYear()} Hakikisha. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
