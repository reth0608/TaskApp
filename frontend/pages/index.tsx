import { useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [tasks, setTasks] = useState<{ content: string; completed: boolean; heading?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const generateTasks = async () => {
    if (!topic || !user) return;

    setLoading(true);
    setError('');
    setTasks([]);

    try {
      const res = await fetch('https://taskapp-zlu2.onrender.com/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.tasks) {
        setTasks(
          data.tasks.map((t: any) => ({
            content: t.content || t,
            completed: t.completed ?? false,
            heading: t.topic || topic,
          }))
        );
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }

    setLoading(false);
  };

  const toggleTaskCompletion = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  function groupByHeading(tasks: {
    content: ReactNode;
    completed: boolean; heading?: string 
}[]) {
    return tasks.reduce((acc: Record<string, typeof tasks>, task) => {
      const key = task.heading || 'Untitled';
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <main className="flex h-screen items-center justify-center bg-black text-white">
        <p>Let's connect on LinkedIn: Rethash Reddy</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-4">AI Task Generator</h1>
      <p className="text-white/80 mb-8 text-center max-w-lg">
        Generate actionable tasks to master anything. Just type a topic and start learning!
      </p>
      <p>
        If this is your first time using in a while, please wait for a bit. Thanks!
      </p>
      <div className="fixed top-8 right-8 z-50">
  <a
    href="/profile"
    className="w-18 h-20 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-yellow-400/50 transition-all text-6xl"
    title="Profile"
  >
    👤
  </a>
</div>

      <div className="fixed bottom-8 right-8 z-50">
  <a
    href="/dashboard"
    className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 text-lg font-semibold tracking-wide"
    title="View Your Tasks"
  >
    Your Tasks
  </a>
</div>


      <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateTasks()}
          placeholder="e.g. Learn TypeScript, Cooking, Guitar"
          className="flex-1 px-4 py-3 rounded text-black text-lg"
        />
        <button
          onClick={generateTasks}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded font-semibold transition"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <p className="text-red-300 mt-4">{error}</p>}

      <div className="mt-8 w-full max-w-xl space-y-6">
        {Object.entries(groupByHeading(tasks)).map(([heading, group], i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold mb-2 text-yellow-300">{heading}</h2>
            <ul className="space-y-2">
              {group.map((task, j) => (
                <li
                  key={j}
                  className="flex items-center gap-3 bg-white/10 p-3 rounded"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(j)}
                  />
                  <span className={task.completed ? 'line-through text-white/60' : ''}>
                    {task.content}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
