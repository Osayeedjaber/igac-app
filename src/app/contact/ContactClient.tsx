"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";
import { Mail, MapPin, Phone, Send, ArrowRight, Instagram, Facebook, Linkedin } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";
import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";
import ScrollVelocity from "@/components/ScrollVelocity";

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        setErrorMsg("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormStatus("success");
                setFormData({ first_name: "", last_name: "", email: "", subject: "", message: "" });
            } else {
                const data = await res.json();
                setErrorMsg(data.error || "Failed to send message");
                setFormStatus("error");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setFormStatus("error");
        }
    };
    return (
        <main className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden selection:bg-primary/30">
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            {/* Hero Section */}
            <section className="pt-32 pb-16 container mx-auto px-6 text-center flex flex-col items-center relative z-10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Meteors number={20} />
                </div>
                
                <Reveal className="flex flex-col items-center w-full relative z-10">
                    <span className="text-primary/80 text-sm font-bold tracking-[0.4em] uppercase mb-6 block border-b border-primary/20 pb-2">24/7 Support</span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground mb-8 tracking-tight">
                        <ShinyText text="Get in Touch" speed={6} />
                    </h1>
                    <div className="text-xl text-muted-foreground max-w-2xl mx-auto h-[3em] flex items-center justify-center">
                        <TextType
                            text="Have questions about the conference? We are here to help you."
                            typingSpeed={40}
                            cursorCharacter="|"
                        />
                    </div>
                </Reveal>
            </section>

            <section className="container mx-auto px-6 mb-24 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 max-w-7xl mx-auto items-start">

                    {/* Contact Info & Socials */}
                    <div className="space-y-16">
                        <Reveal className="space-y-10">
                            <div className="prose prose-invert">
                                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Contact Information</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Whether you're a delegate, faculty advisor, or partner, our team is ready to assist you with any inquiries regarding IGACMUN.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <a href={`mailto:${siteConfig.contact.email}`} className="flex items-start gap-6 group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30">
                                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 font-serif group-hover:text-primary transition-colors">Email Us</h3>
                                        <p className="text-muted-foreground font-light">{siteConfig.contact.email}</p>
                                    </div>
                                </a>

                                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="flex items-start gap-6 group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30">
                                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 font-serif group-hover:text-primary transition-colors">Call Us</h3>
                                        <p className="text-muted-foreground font-light">{siteConfig.contact.phone}</p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-6 group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30">
                                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 font-serif group-hover:text-primary transition-colors">Visit Us</h3>
                                        <p className="text-muted-foreground font-light">{siteConfig.contact.address}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.2} className="space-y-6">
                            <h3 className="text-2xl font-serif font-bold text-foreground">Follow Our Journey</h3>
                            <div className="flex gap-4">
                                {[
                                    { icon: Facebook, href: siteConfig.socials.facebook, label: "Facebook" },
                                    { icon: Instagram, href: siteConfig.socials.instagram, label: "Instagram" },
                                    { icon: Linkedin, href: siteConfig.socials.linkedin, label: "LinkedIn" }
                                ].map((social, idx) => (
                                    <a 
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300"
                                        aria-label={social.label}
                                    >
                                        <social.icon size={22} />
                                    </a>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    {/* Contact Form */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50" />
                        <Reveal delay={0.2}>
                            <div className="bg-[#051b11]/90 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl relative z-10">
                                {formStatus === "success" ? (
                                    <div className="text-center py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8 text-primary animate-in zoom-in duration-500">
                                            <Send size={32} />
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-white mb-4">Message Sent</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                        <button
                                            onClick={() => setFormStatus("idle")}
                                            className="px-8 py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm font-bold tracking-widest uppercase"
                                        >
                                            Send Another
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <h3 className="text-2xl font-serif font-bold text-foreground mb-8">Send a Message</h3>
                                        
                                        {formStatus === "error" && errorMsg && (
                                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                                                {errorMsg}
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">First Name</label>
                                                <input required type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-foreground focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]" placeholder="John" />
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Last Name</label>
                                                <input required type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-foreground focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]" placeholder="Doe" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 group">
                                            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</label>
                                            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-foreground focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]" placeholder="john@example.com" />
                                        </div>
                                        
                                        <div className="space-y-2 group">
                                            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Subject</label>
                                            <input required type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-foreground focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05]" placeholder="General Inquiry" />
                                        </div>
                                        
                                        <div className="space-y-2 group">
                                            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Message</label>
                                            <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-foreground focus:border-primary/50 outline-none transition-all focus:bg-white/[0.05] resize-none" placeholder="How can we help you today?" />
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={formStatus === "submitting"}
                                            className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-widest py-5 rounded-lg hover:bg-white hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-3"
                                        >
                                            <span className="relative z-10">{formStatus === "submitting" ? "Sending..." : "Send Message"}</span>
                                            {formStatus !== "submitting" && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Cinematic Ending - Scroll Velocity */}
            <section className="py-20 border-t border-white/5 relative z-10 bg-background/50 backdrop-blur-md">
                <ScrollVelocity
                    texts={["CONNECT • COLLABORATE • CREATE • ", "IGACMUN • DIPLOMACY • LEADERSHIP • "]}
                    velocity={30}
                    className="text-primary/10 font-bold"
                />
            </section>
        </main>
    );
}
