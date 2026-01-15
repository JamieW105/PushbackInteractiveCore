
import Link from 'next/link'
import { Globe } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12 md:flex md:items-center md:justify-between">
                <div className="flex justify-center space-x-6 md:order-2">
                    <Link href="#" className="text-gray-400 hover:text-white">
                        Discord
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-white">
                        Roblox
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-white">
                        Twitter
                    </Link>
                </div>
                <div className="mt-8 md:mt-0 md:order-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-300 font-semibold">Pushback Interactive</span>
                    </div>
                    <p className="text-center text-xs leading-5 text-gray-500 md:text-left">
                        &copy; {new Date().getFullYear()} Horizon Studios / Pushback Interactive. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
