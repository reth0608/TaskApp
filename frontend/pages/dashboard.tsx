import { useUser } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import { useEffect, useState } from 'react';

type Task = {
  id: string;
  heading: string;
  content: string;
  completed: boolean;
};

export default function Dashboard() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedHeading, setSelectedHeading] = useState<string>('All');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  function groupTasks(tasks: Task[]): Record<string, Task[]> {
    const grouped: Record<string, Task[]> = {};
    for (const task of tasks) {
      const key = task.heading || 'Untitled';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    }
    return grouped;
  }

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/tasks?userId=${user.id}`);
        const data = await res.json();

        if (!data.tasks || !Array.isArray(data.tasks)) {
          console.error('No tasks received');
          return;
        }

        setTasks(data.tasks);
        setGrouped(groupTasks(data.tasks));
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const decoded = decodeURIComponent(hash);
      const target = document.querySelector(decoded);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [grouped]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !currentStatus } : t
      );
      setTasks(updatedTasks);
      setGrouped(groupTasks(updatedTasks));

      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center">Your Tasks</h1>

      {loading ? (
        <p className="text-center text-gray-400">Check me on GitHub @reth0608</p>
      ) : Object.entries(grouped).length === 0 ? (
        <p className="text-center text-gray-400">No Tasks Yet, Start Working!</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <select
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
              className="bg-zinc-800 border border-gray-600 text-white px-4 py-2 rounded"
            >
              <option value="All">All Activities</option>
              {Object.keys(grouped).map((heading) => (
                <option key={heading} value={heading}>
                  {heading}
                </option>
              ))}
            </select>

            <select
              value={completionFilter}
              onChange={(e) => setCompletionFilter(e.target.value as any)}
              className="bg-zinc-800 border border-gray-600 text-white px-4 py-2 rounded"
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <div className="space-y-10 max-w-2xl mx-auto">
            {Object.entries(grouped)
              .filter(([heading]) => selectedHeading === 'All' || heading === selectedHeading)
              .map(([heading, topicTasks]) => {
                const filteredTasks = topicTasks.filter((task) => {
                  if (completionFilter === 'completed') return task.completed;
                  if (completionFilter === 'incomplete') return !task.completed;
                  return true;
                });

                if (filteredTasks.length === 0) return null;

                return (
                  <section key={heading} id={`topic-${encodeURIComponent(heading)}`}>
                    <h2 className="text-2xl font-bold mb-4 underline underline-offset-4">
                      {heading}
                    </h2>
                    <ul className="space-y-3">
                      {filteredTasks.map((task) => (
                        <li
                          key={task.id}
                          className="bg-white/10 p-4 rounded-lg flex items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="w-5 h-5"
                          />
                          <span
                            className={`text-lg ${
                              task.completed ? 'line-through text-white/50' : ''
                            }`}
                          >
                            {task.content}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
          </div>
        </>
      )}
    </main>
  );
}

// 🔐 Secure this page server-side
export async function getServerSideProps(context: any) {
  const { userId } = getAuth(context.req);

  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  return { props: {} };
}
