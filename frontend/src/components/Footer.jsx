import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className="relative mt-32 w-full">
      <div 
        className="absolute top-0 left-0 w-full h-8 bg-transparent z-10"
        style={{
          background: 'linear-gradient(45deg, #442D1C 12px, transparent 0), linear-gradient(-45deg, #442D1C 12px, transparent 0)',
          backgroundSize: '24px 100%',
          backgroundRepeat: 'repeat-x',
          transform: 'translateY(-100%)'
        }}
      ></div>
      <footer className="bg-[#442D1C] text-gray-300">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 py-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5D3E26] to-[#362416] flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">
                CH
              </div>
              <span className="text-white font-thin font-outfit text-3xl tracking-widest uppercase">ClubHub</span>
            </div>
            <p className="text-white/50 leading-relaxed max-w-sm italic font-light">
              Designing premium communities and seamless management experiences for clubs that matter.
            </p>
          </div>
          
          <div>
            <h4 className="text-white/80 font-bold mb-6 text-sm tracking-widest uppercase font-outfit">Navigation</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Home</Link></li>
              <li><Link to="/miniclubs" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Clubs</Link></li>
              <li><Link to="/events" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Events</Link></li>
              <li><Link to="/members" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Members</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white/80 font-bold mb-6 text-sm tracking-widest uppercase font-outfit">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Dashboard</Link></li>
              <li><Link to="/committees" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Committees</Link></li>
              <li><Link to="/locations" className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Locations</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 py-10 text-center">
          <p className="text-xs text-white/20 tracking-[0.3em] uppercase font-light">
            &copy; {new Date().getFullYear()} CLUB HUB CREATIVE. EST. 2024.
          </p>
        </div>
      </footer>
    </div>
  )
}
