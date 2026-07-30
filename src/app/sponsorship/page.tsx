"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Handshake, Loader2, ArrowRight } from "lucide-react";

const plans = [
  { name: "Bronze", price: "₹50,000+", features: ["Logo on event website", "Social media mention", "Event passes (2 attendees)"] },
  { name: "Silver", price: "₹1,00,000+", features: ["Logo on event website", "Event passes (5 attendees)", "Quarter-page ad in program", "Social media mention"] },
  { name: "Gold", price: "₹2,50,000+", features: ["Logo on all marketing materials", "Workshop speaking slot", "Standard booth space", "Half-page ad in event program", "Social media mentions", "Networking event access"] },
  { name: "Platinum", price: "₹5,00,000+", features: ["Logo on all marketing materials", "Keynote speaking slot", "Premium booth space", "Full-page ad in event program", "Social media campaign", "VIP networking access", "Custom workshop session", "First right of refusal for future events"] },
];

export default function SponsorshipPage() {
  const [formData, setFormData] = useState({ contact_name: "", email: "", company_name: "", sponsorship_level: "gold", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sponsorship request submitted successfully!");
        setFormData({ contact_name: "", email: "", company_name: "", sponsorship_level: "gold", message: "" });
      } else {
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-700/20 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold text-sm mb-6 border border-blue-500/20">
                Sponsor Us
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Amplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Impact</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join us in shaping the future of technology. Explore our sponsorship tiers and partner with ABWcurious for unmatched visibility and engagement.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {plans.map((plan, idx) => (
                <div key={plan.name} className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col h-full hover:border-blue-500/50 transition-colors">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-blue-400 mb-6">{plan.price}</div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => setFormData(f => ({ ...f, sponsorship_level: plan.name.toLowerCase() }))}>
                    Select {plan.name}
                  </Button>
                </div>
              ))}
            </div>

            {/* Form Section */}
            <div className="max-w-2xl mx-auto p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="text-center mb-8">
                <Handshake className="size-10 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Request Sponsorship</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input required value={formData.contact_name} onChange={e => setFormData(f => ({ ...f, contact_name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input required type="email" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input required value={formData.company_name} onChange={e => setFormData(f => ({ ...f, company_name: e.target.value }))} placeholder="Company Ltd." />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Desired Plan</label>
                    <Select value={formData.sponsorship_level} onValueChange={v => setFormData(f => ({ ...f, sponsorship_level: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {plans.map(p => <SelectItem key={p.name} value={p.name.toLowerCase()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <Textarea value={formData.message} onChange={e => setFormData(f => ({ ...f, message: e.target.value }))} placeholder="Any specific requirements or questions?" rows={4} />
                </div>
                <Button type="submit" disabled={loading} className="w-full btn-glow">
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
