import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type Task = {
  id: string;
  heading: string;
  content: string;
  completed: boolean;
};

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [headings, setHeadings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tasks?userId=${user.id}`);
        const data = await res.json();
        if (!data.tasks || !Array.isArray(data.tasks)) return;

        const uniqueHeadings = Array.from(
          new Set(data.tasks.map((task: Task) => task.heading).filter(Boolean))
        ) as string[];

        setHeadings(uniqueHeadings);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (!isLoaded) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold text-center mb-2">Your Profile</h1>
        <div className="bg-white/10 p-6 rounded-xl shadow-md">
          <p className="text-lg">
            <span className="font-semibold">Name:</span> {user?.fullName}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {user?.primaryEmailAddress?.emailAddress[0]+user?.primaryEmailAddress?.emailAddress[1]+"x".repeat(user?.primaryEmailAddress?.emailAddress.length-14)+user?.primaryEmailAddress?.emailAddress.slice(-12)}
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Active Learning</h2>
          {loading ? (
            <p className="text-gray-400">Mail me rethashdevreddy@gmail.com</p>
          ) : headings.length === 0 ? (
            <p className="text-gray-400">No active learning topics found.</p>
          ) : (
            <ul className="space-y-4">
              {headings.map((heading) => (
                <li
                  key={heading}
                  className="flex items-center justify-between bg-white/10 px-5 py-4 rounded-lg"
                >
                  <span className="text-lg font-medium">{heading}</span>
                  <a
                    href={`/dashboard#topic-${encodeURIComponent(heading)}`}
                    className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-500 transition"
                  >
                    View Tasks
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
