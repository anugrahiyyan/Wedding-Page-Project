import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";

const Features = () => {
    return (
        <section className="relative overflow-hidden py-20">
            <div className="container max-w-8xl mx-auto px-5 2xl:px-0 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="order-2 md:order-1">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/categories/feature-homepage.jpg"
                                alt="Wedding Invitation"
                                width={700}
                                height={400}
                                className="w-full object-cover h-[600px]"
                                unoptimized={false}
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <p className="text-primary text-base font-bold flex gap-2.5 items-center mb-4">
                            <Icon icon="solar:star-bold" className="text-xl" />
                            WHY CHOOSE RABIKUU
                        </p>
                        <h2 className="lg:text-5xl text-4xl mb-6 font-medium leading-[1.2] text-dark dark:text-white">
                            Premium Digital Invitations
                        </h2>
                        <p className="text-dark/60 dark:text-white/60 text-lg leading-relaxed mb-8">
                            We provide high-quality, customizable digital wedding invitations that are easy to share and look stunning on any device.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                "Responsive Design for All Devices",
                                "Customizable Music & Galleries",
                                "RSVP & Guest Management",
                                "Google Maps Integration"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-dark dark:text-white font-medium">
                                    <span className="bg-primary/10 text-primary p-1 rounded-full">
                                        <Icon icon="solar:check-circle-bold" width={20} />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link href="https://wa.me/6281230826731" target="_blank" className="py-4 px-8 bg-primary text-white rounded-full font-semibold hover:bg-dark duration-300 inline-flex items-center gap-2">
                            Start Creating <Icon icon="solar:arrow-right-linear" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
