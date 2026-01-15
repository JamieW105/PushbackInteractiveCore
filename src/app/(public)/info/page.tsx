
import { Users, Code, PenTool, Rocket } from 'lucide-react'

export default function InfoPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

            <section className="text-center space-y-6">
                <h1 className="text-5xl font-bold">About Pushback Interactive</h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    Founded in 2024, we are a collective of passionate developers, artists, and aviation enthusiasts dedicated to pushing the technical boundaries of the Roblox platform.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 space-y-4">
                    <Rocket className="w-10 h-10 text-pbi-blue mb-4" />
                    <h2 className="text-2xl font-bold">Our Mission</h2>
                    <p className="text-gray-400 leading-relaxed">
                        To bridge the gap between casual gaming and professional simulation. We believe that Roblox games can be visually stunning and mechanically complex without sacrificing accessibility.
                    </p>
                </div>
                <div className="glass-panel p-8 space-y-4">
                    <Code className="w-10 h-10 text-pbi-purple mb-4" />
                    <h2 className="text-2xl font-bold">Development Philosophy</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Quality over quantity. We build custom frameworks, write clean code, and optimize for performance. Every asset is handcrafted to meet our rigorous standards.
                    </p>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <Users className="w-6 h-6 text-white" />
                    <h2 className="text-3xl font-bold">The Team</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <TeamMember name="Horizon" role="Lead Developer" />
                    <TeamMember name="PilotJoe" role="3D Modeler" />
                    <TeamMember name="VectorBias" role="UI/UX Designer" />
                    <TeamMember name="NullPtr" role="Backend Engineer" />
                </div>
            </section>

        </div>
    )
}

function TeamMember({ name, role }: { name: string, role: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition group">
            <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden border-2 border-transparent group-hover:border-pbi-blue transition">
                {/* Placeholder Avatar */}
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800" />
            </div>
            <h3 className="font-bold text-white text-lg">{name}</h3>
            <p className="text-pbi-blue text-sm">{role}</p>
        </div>
    )
}
