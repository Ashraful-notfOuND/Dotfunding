"use client";
import Image from "next/image";
import { useState } from "react";
import { ClockIcon } from '@heroicons/react/24/outline';

// Dummy user data
export default function HomePage() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const categories = [
    "Art", "Comics", "Crafts", "Dance", "Design", "Fashion", "Film", "Food", "Games", "Journalism", "Music", "Photography", "Publishing", "Technology", "Theater", "Discover"
  ];
  return (
  <main className="max-w-4xl mx-auto py-10 px-4">
      {/* Search bar is in layout, so this comes below */}
      <section className="flex flex-wrap gap-3 justify-center mb-6">
        {categories.map((cat) => (
          <button key={cat} className="px-4 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-sm font-medium shadow">
            {cat}
          </button>
        ))}
      </section>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bring a creative project to life</h2>
        <p className="text-gray-500">Explore categories and discover amazing ideas!</p>
      </div>
    <hr className="border-t border-gray-200 mb-8" />

    {/* White background only for project section */}
    <section className="flex flex-col sm:flex-row gap-8 items-start bg-white rounded-xl p-6">
        {/* Left: Featured Project */}
        <div className="w-full sm:w-[50%] flex flex-col" style={{ minHeight: '500px' }}>
          <h3 className="text-xs font-Inter mb-0 !text-gray-800 antialiased">FEATURED PROJECT</h3>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
            <div className="mb-0 flex justify-center">
              <img src="/waterbottle.jpeg" alt="Eco-Friendly Water Bottle" className="w-80 h-40 rounded-lg object-cover" />
            </div>
            <div className="w-full bg-gray-100 h-1 mb-1">
                <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `82%` }}></div>
            </div>
            <h4 className="text-lg font-bold text-gray-600 mb-0">Eco-Friendly Water Bottle</h4>
            <span className="text-xs text-gray-600 mb-1 text-left">Ifti</span>
            <p className="text-gray-600 mb-3 flex-1">A reusable bottle made from sustainable materials.</p>
            <div className="mt-auto">
              <span className="text-xs text-gray-500">82% funded</span>
              <p></p>
              <span className="text-xs border p-1 border rounded-lg border-gray-300 text-black mb-2 font-medium">Design</span>
            </div>
          </div>
        </div>
        {/* Middle vertical line */}
        <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>
        {/* Right: Recommended Projects */}
        <div className="w-full sm:w-[50%] flex flex-col" style={{ height: '390px' }}>
          <h3 className="text-xs font-normal mb-0 !text-gray-800">RECOMMENDED FOR YOU</h3>
           <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">
             {[
                 { 
                   title: "Modular Desk:A sleek, customizable desk system",
                   creator: "Alice",
                   image: "/modular_desk.jpeg",
                   funded: 60,
                   daysLeft: 12,
                   description: "A sleek, customizable desk system for modern workspaces.",
                 },
                 {
                   title: "Indie Comic Series",
                   creator: "Bob",
                   image: "/globe.svg",
                   funded: 95,
                   daysLeft: 5,
                   description: "A new comic universe with diverse heroes and stories.",
                 },
                 {
                   title: "Smart Music Player",
                   creator: "Carol",
                   image: "/next.svg",
                   funded: 40,
                   daysLeft: 20,
                   description: "A portable player with AI-powered playlists and smart features.",
                 },
                 {
                   title: "Artisan Food Box",
                   creator: "Dave",
                   image: "/vercel.svg",
                   funded: 70,
                   daysLeft: 8,
                   description: "Curated food experiences from local chefs delivered to your door."
                 },
               ].map((project, idx) => (
                  <div
                    key={idx}
                    className={`relative flex flex-col transition-all duration-300 rounded-lg bg-white ${expandedIdx === idx ? "z-30 shadow-2xl' scale-[1.02]": "z-10 hover:shadow-md"}`}
                    onMouseEnter={() => setExpandedIdx(idx)}
                    onMouseLeave={() => setExpandedIdx(null)}
                  >
                  {/*Image*/}
                  <div className="relative pb-[50%]">
                  <div className="absolute inset-0 flex justify-center items-center">
                    <img 
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full rounded-lg object-cover border border-gray-200"
                    />
                    </div>
                    {/* Progress bar*/}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gray-100 rounded-full h-1">
                      <div 
                        className="bg-indigo-400 h-1 rounded-full"
                        style={{ width: `${project.funded}%` }}>
                      </div>
                    </div>
                  </div>
                  {/*Title*/}
                  <h4
                    className="text-sm font-medium text-gray-600 mt-2 mb-0 line-clamp-2 transition">{project.title}
                  </h4>
                  {/*Creator*/}
                  <span 
                    className="text-xs text-gray-600 mb-2">{project.creator}
                  </span>
                  {/* Info row*/}
                  <div 
                    className="flex items-center justify-between text-xs text-gray-500 px-2 py-1">
                    <span 
                      className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4 text-gray-400"/>
                      {project.daysLeft} days left
                    </span>
                    <span 
                      className="text-gray-400">•
                    </span>
                    <span 
                      className="font-semibold text-gray-400">{project.funded}% funded
                    </span>
                  </div>
                  {/*Description*/}
                  {expandedIdx === idx && (
                    <div className="animate-fadeIn absolute top-full left-0 mt-1 inline-block p-3 bg-white shadow-xl rounded-lg text-xs text-gray-600 z-40 break-words">
                    {/* <div className="mt-2 p-3 bg-white text-xs text-gray-600 border-t border-gray-200 animate-fadeIn">   */}
                    {project.description}
                    </div>
                  )}
                 </div>
               ))}
          </div>
        </div>
      </section>
    </main>
  );
}