
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, Plane, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24 pb-24">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradients/Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30" />

        <div className="relative z-20 text-center space-y-6 px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D13800]/10 border border-[#D13800]/20 text-[#D13800] text-sm font-medium animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D13800]"></span>
            </span>
            Now Hiring Developers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
            Redefining Roblox <br />
            <span className="text-gradient">Aviation</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Pushback Interactive is a next-generation development studio creating immersive, high-fidelity aviation experiences on the Roblox platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/games"
              className="px-8 py-4 bg-[#D13800] hover:bg-[#942200] text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-glow flex items-center justify-center gap-2"
            >
              Our Projects <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://discord.gg/yourdiscord"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white rounded-full font-bold transition-all flex items-center justify-center gap-2"
            >
              Join Discord
            </Link>
          </div>
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
          <p className="text-gray-400">Pushing the boundaries of what's possible in engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Box className="w-8 h-8 text-[#D13800]" />}
            title="Custom Assets"
            description="High-fidelity 3D models and textures created from scratch to ensure unique visual identity for every project."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-[#D13800]" />}
            title="AI Passengers"
            description="Revolutionary NPC systems that behave realistically, creating a living, breathing airport environment."
          />
          <FeatureCard
            icon={<Plane className="w-8 h-8 text-[#D13800]" />}
            title="Advanced Physics"
            description="Custom flight dynamics and ground handling physics that rival standalone flight simulators."
          />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-y border-white/5 bg-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value="340+" label="Community Members" />
          <StatItem value="5+" label="Active Projects" />
          <StatItem value="24/7" label="Server Uptime" />
          <StatItem value="100%" label="Passion" />
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 hover:bg-white/10 transition duration-300 group">
      <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl font-bold text-white">{value}</div>
      <div className="text-sm text-[#D13800] uppercase tracking-wider font-semibold">{label}</div>
    </div>
  )
}
