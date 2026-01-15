
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Plane, Terminal, Hammer } from "lucide-react"

export default function GamesPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold">Our Projects</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Experience the next generation of Roblox aviation with our flagship titles and upcoming releases.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Featured Project: Ground Operator */}
                <div className="glass-panel p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pbi-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-pbi-blue/20 text-pbi-blue text-sm font-bold">
                                <Terminal className="w-4 h-4" />
                                FLAGSHIP
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Ground Operator</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Step into the high-stakes world of airport ground handling. Manage complex turnarounds, operate heavy machinery with realistic physics, and ensure every flight leaves on schedule.
                            </p>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pbi-blue" /> Realistic Pushback Physics</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pbi-blue" /> Career Progression System</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pbi-blue" /> Multiplayer Co-op</li>
                            </ul>
                            <div className="pt-4">
                                <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                                    View on Roblox <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full aspect-video bg-black/50 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {/* Placeholder for game thumbnail */}
                            <div className="text-gray-500 flex flex-col items-center gap-2">
                                <Plane className="w-12 h-12 opacity-50" />
                                <span>Gameplay Trailer</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project 2: Coming Soon */}
                <div className="glass-panel p-8 flex flex-col md:flex-row gap-8 items-center opacity-75 hover:opacity-100 transition">
                    <div className="w-full md:w-1/3 aspect-video bg-black/50 rounded-xl border border-white/10 flex items-center justify-center">
                        <Hammer className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/10 text-orange-400 text-sm font-bold">
                            IN DEVELOPMENT
                        </div>
                        <h3 className="text-2xl font-bold text-white">Project: Tailwind</h3>
                        <p className="text-gray-400">
                            A revolutionary air traffic control simulator designed to test your nerve and precision.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
