import Image from "next/image";

// Dummy user data
const user = {
  name: "Jane Doe",
  avatar: "/vercel.svg", // Use a public image for demo
  bio: "Enthusiastic backer and creator. Love supporting creative ideas!",
  stats: {
    pledged: 1200,
    created: 3,
    backed: 15,
  },
};

const backedProjects = [
  { title: "Smart Water Bottle", status: "Funded", amount: 50 },
  { title: "Eco-Friendly Backpack", status: "Active", amount: 75 },
];

const createdProjects = [
  { title: "Solar Charger", status: "Active", raised: 3200 },
  { title: "Modular Desk", status: "Funded", raised: 5000 },
];

export default function DashboardPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      {/* Profile Section */}
      <section className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 relative rounded-full overflow-hidden border">
          <Image src={user.avatar} alt="User Avatar" fill />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600 mt-2">{user.bio}</p>
        </div>
      </section>
      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-lg font-semibold">${user.stats.pledged}</div>
          <div className="text-gray-500 text-sm">Total Pledged</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-lg font-semibold">{user.stats.created}</div>
          <div className="text-gray-500 text-sm">Projects Created</div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-lg font-semibold">{user.stats.backed}</div>
          <div className="text-gray-500 text-sm">Projects Backed</div>
        </div>
      </section>
      {/* Backed Projects Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Backed Projects</h2>
        <div className="bg-white shadow rounded p-4">
          <ul>
            {backedProjects.map((project, idx) => (
              <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{project.title}</span>
                <span className="text-gray-500">{project.status} · ${project.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {/* Created Projects Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Created Projects</h2>
        <div className="bg-white shadow rounded p-4">
          <ul>
            {createdProjects.map((project, idx) => (
              <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{project.title}</span>
                <span className="text-gray-500">{project.status} · Raised ${project.raised}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}