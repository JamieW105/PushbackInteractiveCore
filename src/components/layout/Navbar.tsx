
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, Globe, Shield } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Info', href: '/info' },
    { name: 'Trello', href: '/trello' },
]

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Globe className="h-6 w-6 text-pbi-blue" />
                        <Link href="/" className="font-bold text-xl tracking-tight text-white hover:opacity-80 transition">
                            Pushback<span className="text-pbi-blue">Interactive</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                        pathname === item.href
                                            ? "bg-white/10 text-white shadow-glow"
                                            : "text-gray-300 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Actions (Login/Admin) */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-white hover:border-white/30 transition shadow-glow"
                        >
                            <Shield className="w-3 h-3" />
                            Staff Area
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel mx-2 mt-2 mb-2 p-2 absolute inset-x-0 top-16">
                    <div className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "block px-3 py-2 rounded-md text-base font-medium",
                                    pathname === item.href
                                        ? "bg-pbi-blue/20 text-white"
                                        : "text-gray-300 hover:text-white hover:bg-white/10"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Staff Area
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
