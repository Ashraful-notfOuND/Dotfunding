import Image from "next/image";
import { ClockIcon } from '@heroicons/react/24/outline';

// Dummy user data
export default function HomePage() {
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
            <div className="mb-3 flex justify-center">
              <Image src="/file.svg" alt="Eco-Friendly Water Bottle" width={120} height={120} className="rounded-lg object-cover" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-1">Eco-Friendly Water Bottle</h4>
            <span className="text-xs text-indigo-500 mb-2 font-medium">Design</span>
            <p className="text-gray-600 mb-3 flex-1">A reusable bottle made from sustainable materials.</p>
            <div className="mt-auto">
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `82%` }}></div>
              </div>
              <span className="text-xs text-gray-500">82% funded</span>
            </div>
          </div>
        </div>
        {/* Middle vertical line */}
        <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>
        {/* Right: Recommended Projects */}
        <div className="w-full sm:w-[50%] flex flex-col" style={{ height: '337px' }}>
          <h3 className="text-xs font-normal mb-0 !text-gray-800">RECOMMENDED FOR YOU</h3>
           <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">
             {[
               {
                 title: "Modular Desk",
                 creator: "Alice",
                 image: "/window.svg",
                 funded: 60,
                 daysLeft: 12,
               },
               {
                 title: "Indie Comic Series",
                 creator: "Bob",
                 image: "/globe.svg",
                 funded: 95,
                 daysLeft: 5,
               },
               {
                 title: "Smart Music Player",
                 creator: "Carol",
                 image: "/next.svg",
                 funded: 40,
                 daysLeft: 20,
               },
               {
                 title: "Artisan Food Box",
                 creator: "Dave",
                 image: "/vercel.svg",
                 funded: 70,
                 daysLeft: 8,
               },
             ].map((project, idx) => (
               <div key={idx} className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: '#fff', boxShadow: 'none', border: 'none' }}>
                 {/* Top: Project photo, half the box height */}
                 <div className="flex justify-center items-center" style={{ height: '50%' }}>
                   <Image src={project.image} alt={project.title} width={80} height={10} className="rounded-lg object-cover border-2 border-gray-200" />
                 </div>
                 {/* Progress bar directly below photo */}
                 <div className="w-full bg-gray-100 rounded-full h-1">
                   <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${project.funded}%` }}></div>
                 </div>
                 {/* Project name and creator */}
                 <h4 className="text-base font-bold text-gray-800 mt-1 mb-0 text-left">{project.title}</h4>
                 <span className="text-xs text-gray-400 mb-1 text-left">{project.creator}</span>
                 {/* Info row: left time, right percent */}
                 <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                   <span className="flex items-center gap-1">
                     <ClockIcon className="h-4 w-4 text-gray-400" />
                     {project.daysLeft} days left
                   </span>
                   <span className="text-gray-400">•</span>
                   <span className="font-semibold text-indigo-600">{project.funded}% funded</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>
    </main>
  );
}