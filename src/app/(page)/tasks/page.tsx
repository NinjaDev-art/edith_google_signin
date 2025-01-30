'use client'

import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
import { ITask } from "@/app/lib/interface";
import Task from "@/app/components/Task";

const Tasks = () => {
  const [typeTask, setTypeTask] = useState<string>("once");
  const [isOpen, setIsOpen] = useState(false);
  const { userData, setUserData, setUserActivities } = useUser();
  const [earned, setEarned] = useState(0);
  const [tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks`);
      const data = await tasks.json();
      setTasks(data.tasks);
    }
    fetchTasks();
  }, []);

  return (
    <main className="w-full min-h-screen font-aeonik text-[#878787]">
      <div className="flex flex-col p-5">
        <div className="flex flex-col gap-6 pt-3 text-left pb-9">
          <h3 className="text-base text-[#FCFCFC] text-medium">Statistics</h3>
          <div className="flex flex-col w-full gap-6 p-3 border border-[#FFFFFF14] bg-[#FFFFFF12] rounded-xl">
            <div className="grid grid-cols-2 gap-[5px]">
              <div className="flex flex-col w-full gap-2 p-3 border border-[#262626] rounded-xl bg-[#010101] justify-between">
                <span className="text-xs">Tasks Completed</span>
                <span className="text-xl font-bold text-[#FFFFFF] leading-none">{userData.tasks.length}</span>
              </div>
              <div className="flex flex-col w-full gap-3 p-3 border border-[#262626] rounded-xl bg-[#010101] justify-between">
                <span className="text-xs">Success Rate</span>
                <span className="text-xl font-bold text-[#FFFFFF] leading-none">100%</span>
              </div>
              <div className="flex flex-col w-full gap-3 p-3 pr-16 border border-[#262626] rounded-xl bg-[#010101] justify-between relative overflow-hidden">
                <span className="text-xs">Total Earned</span>
                <span className="text-xl font-bold text-[#FFFFFF] leading-none">{userData.points}</span>
                <Image src="/images/gold-ether.png" className="w-10 h-10 absolute top-1/2 -translate-y-1/2 right-3" width={40} height={40} alt="gold-ether" />
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-20 h-8 bg-[#FDC818] blur-xl" />
              </div>
              <div className="flex flex-col w-full gap-3 p-3 pr-16 border border-[#262626] rounded-xl bg-[#010101] justify-between relative overflow-hidden">
                <span className="text-xs">Unlockable Points</span>
                <span className="text-xl font-bold text-[#FFFFFF] leading-none">{userData.points}</span>
                <Image src="/images/silver-ether.png" className="w-10 h-10 absolute top-1/2 -translate-y-1/2 right-3" width={40} height={40} alt="silver-ether" />
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-20 h-8 bg-[#FFFFFF] blur-xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 pt-3 mb-20 text-left pb-9">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-[#FFFFFF] text-medium">
              Tasks
            </h3>
            <div className="p-[1px] bg-gradient-to-b from-[#202020] to-[#272727] rounded-full">
              <div className="bg-[#101010] rounded-full p-1 flex items-center justify-between gap-1">
                <button
                  onClick={() => setTypeTask("once")}
                  className="p-[1px] bg-gradient-to-b from-[#202020] to-[#272727] rounded-full w-[96px] h-[31px] flex items-center justify-center border-none focus:outline-none"
                >
                  <div className={`${typeTask === "once" ? 'bg-[#FFFFFF] text-[#010101]' : 'bg-[#FFFFFF1F] text-[#FCFCFC] hover:bg-[#FFFFFF] hover:text-[#010101]'} rounded-full text-base font-medium w-full h-full flex items-center justify-center transition-colors duration-200`}>
                    One-Time
                  </div>
                </button>
                <button
                  onClick={() => setTypeTask("daily")}
                  className="p-[1px] bg-gradient-to-b from-[#202020] to-[#272727] rounded-full w-[96px] h-[31px] flex items-center justify-center border-none focus:outline-none"
                >
                  <div className={`${typeTask === "daily" ? 'bg-[#FFFFFF] text-[#010101]' : 'bg-[#FFFFFF1F] text-[#FCFCFC] hover:bg-[#FFFFFF] hover:text-[#010101]'} rounded-full text-base font-medium w-full h-full flex items-center justify-center transition-colors duration-200`}>
                    Daily Tasks
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
              {
                tasks && tasks.map((task: ITask, index: number) => {
                  if (task.type != typeTask) {
                    return null;
                  }
                  return (
                    <Task
                      key={index}
                      task={task}
                      userData={userData}
                      setUserData={setUserData}
                      setUserActivities={setUserActivities}
                      setEarned={setEarned}
                      setIsOpen={setIsOpen}
                    />
                  )
                })
              }
          </div>
        </div>
      </div>
      {isOpen && <Modal closeModal={() => setIsOpen(false)} earned={earned} />}
    </main >
  );
};

export default Tasks;  