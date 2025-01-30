import React, { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { ITask } from '../lib/interface';
import LoadingIcon from './LoadingIcon';
import { v4 as uuidv4 } from 'uuid';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: ITask;
    setTasks: Dispatch<SetStateAction<ITask[]>>;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, setTasks }) => {
    const [task, setTask] = useState<ITask>({
        _id: '',
        title: '',
        type: 'once',
        points: 0,
        index: uuidv4(),
        method: 'twitter_follow',
        target: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSaveTask = async (task: ITask) => {
        try {
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task })
            });
            const data = await response.json();
            if (data.success) {
                setTasks(data.tasks);
                onClose();
            } else {
                setError('Failed to save task');
            }
        } catch (error) {
            setError('Failed to save task');
            console.log(error);
        }
    }


    useEffect(() => {
        if (taskToEdit) {
            setTask(taskToEdit);
        } else {
            setTask({
                _id: '',
                title: '',
                type: 'once',
                points: 0,
                index: uuidv4(),
                method: 'twitter_follow',
                target: '',
            });
        }
    }, [taskToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!task.title || !task.points || task.points <= 1) {
            setError('Please fill in all fields');
            return;
        }
        const usernamePattern = /^@(\w){1,15}$/;
        if (!usernamePattern.test(task.title)) {
            setError('Invalid username format. Please use @username');
            return;
        }
        setError('');
        setIsLoading(true);
        await handleSaveTask(task);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#101010] p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-semibold text-[#FCFCFC] mb-6">
                    {taskToEdit ? 'Edit Task' : 'Add Task'}
                </h2>
                <label className="block mb-4 text-[#FCFCFC]">
                    Title*
                    <input
                        type="text"
                        name="title"
                        value={task.title}
                        onChange={handleChange}
                        placeholder="@username"
                        className="mt-2 p-3 w-full bg-[#1A1A1A] text-[#FCFCFC] rounded border border-gray-700"
                    />
                </label>
                <label className="block mb-4 text-[#FCFCFC]">
                    Type*
                    <select
                        name="type"
                        value={task.type}
                        onChange={handleChange}
                        className="mt-2 p-3 w-full bg-[#1A1A1A] text-[#FCFCFC] rounded border border-gray-700"
                    >
                        <option value="once">Once</option>
                    </select>
                </label>
                <label className="block mb-4 text-[#FCFCFC]">
                    Points*
                    <input
                        type="number"
                        name="points"
                        value={task.points}
                        onChange={handleChange}
                        placeholder="Points"
                        className="mt-2 p-3 w-full bg-[#1A1A1A] text-[#FCFCFC] rounded border border-gray-700"
                    />
                </label>
                <label className="block mb-4 text-[#FCFCFC]">
                    Method*
                    <select
                        name="method"
                        value={task.method}
                        onChange={handleChange}
                        className="mt-2 p-3 w-full bg-[#1A1A1A] text-[#FCFCFC] rounded border border-gray-700"
                    >
                        <option value="twitter_follow">Twitter Follow</option>
                    </select>
                </label>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end mt-6">
                    <button
                        className="mr-3 px-5 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingIcon /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;