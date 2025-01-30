'use client';
import { useState } from 'react';
import { ITask } from '@/app/lib/interface';
import TaskModal from '@/app/components/TaskModal';

const Admin = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<ITask | undefined>(undefined);

    const fetchTasks = async () => {
        const tasks = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks`);
        const data = await tasks.json();
        setTasks(data.tasks);
    }

    const handleAuth = async () => {
        setIsLoading(true);
        try {
            const auth = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await auth.json();
            if (data.success) {
                setIsAuth(true);
                fetchTasks();
            } else {
                setIsAuth(false);
                setError('Invalid username or password');
            }
        } catch (error) {
            console.log(error);
            setError('Invalid username or password');
        } finally {
            setIsLoading(false);
        }

    }

    const handleAddTask = () => {
        setTaskToEdit(undefined);
        setIsOpen(true);
    }

    const handleEditTask = (id: string) => {
        setTaskToEdit(tasks.find(task => task._id === id));
        setIsOpen(true);
    }

    const handleDeleteTask = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (confirmDelete) {
            try {
                const response = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });
                const data = await response.json();
                if (data.success) {
                    setTasks(data.tasks);
                } else {
                    setError('Failed to delete task');
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleCloseModal = () => {
        setIsOpen(false);
        setTaskToEdit(undefined);
    }

    return (
        <main className="w-full min-h-screen font-aeonik text-[#878787]">
            {
                isAuth ? (
                    <div className="task-manager-container shadow-md rounded-lg p-6">
                        <div className='flex w-full justify-between items-center mb-6'>
                            <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
                            <button
                                className="add-task-button px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                onClick={handleAddTask}
                            >
                                Add New Task
                            </button>
                        </div>
                        <table className="task-table w-full text-left text-[#FCFCFC]">
                            <thead>
                                <tr className="bg-[#1A1A1A]">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Points</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Target</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id} className="bg-[#2A2A2A] hover:bg-[#333333]">
                                        <td className="p-4">{task.method == 'twitter_follow' ? `Follow ${task.title} on Twitter` : task.title}</td>
                                        <td className="p-4">{task.type}</td>
                                        <td className="p-4">{task.points}</td>
                                        <td className="p-4">{task.method}</td>
                                        <td className="p-4">{task.target}</td>
                                        <td className="p-4">
                                            <button
                                                className="edit-button mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                onClick={() => handleEditTask(task._id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                onClick={() => handleDeleteTask(task._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col p-5 min-h-screen items-center justify-center">
                        <h1 className="text-[#FCFCFC] font-bold text-xl">Admin Login</h1>
                        <div className="flex flex-col gap-6 pt-3 text-left pb-9">
                            <input
                                type="text"
                                className="p-3 border border-[#262626] rounded-xl bg-[#010101] text-[#FCFCFC] w-[300px]"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                className="p-3 border border-[#262626] rounded-xl bg-[#010101] text-[#FCFCFC] w-[300px]"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <p className="text-red-500">{error}</p>}
                            <button
                                className="admin-login-button p-3 bg-gradient-to-b from-[#202020] to-[#272727] rounded-xl text-[#FCFCFC] hover:bg-[#FFFFFF] hover:text-[#010101] transition-colors duration-200"
                                onClick={handleAuth}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Login'}
                            </button>
                        </div>
                    </div>
                )
            }
            <TaskModal isOpen={isOpen} onClose={handleCloseModal} setTasks={setTasks} taskToEdit={taskToEdit} />
        </main>
    )
}

export default Admin;