'use client'

import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";
import TweetModal from "@/app/components/TweetModal";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
import { Activity, Task, UserActivities } from "@/app/lib/interface";

const Tasks = () => {
  const [typeTask, setTypeTask] = useState<string>("once");
  const [isOpen, setIsOpen] = useState(false);
  const [isTweetOpen, setIsTweetOpen] = useState(false);
  const { userData, setUserData, setUserActivities } = useUser();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [earned, setEarned] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);

  const twitterFollow = () => {
    setLoading(true)
    const followUrl = `https://twitter.com/intent/follow?user_id=${process.env.TWITTER_USER_ID}`
    const newPopup = window.open(followUrl, 'Follow', 'width=600,height=400')
    if (!newPopup) {
      setLoading(false)
      alert('Please allow popups to follow on Twitter')
      return
    }
    setPopup(newPopup)
  }

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/userFollow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetUserId: process.env.TWITTER_USER_ID,
            loggedInUserId: userData?.twitterId,
            telegramId: userData?.user_id
          })
        })
        const data = await response.json();

        // Handle both 200 and 201 status codes
        if (data.success) {
          setUserData(data.user);
          setEarned(10);
          setIsOpen(true);
          const activities = Array.isArray(data.activity) ? data.activity : [];
          const transformedActivities: Activity[] = activities.map((item: { rewarded_by: { user_id: string }; type: string; referral_code: string; points: number; createdAt: string; }) => ({
            rewarded_user_id: item.rewarded_by?.user_id,
            type: item.type,
            referral_code: item.referral_code,
            points: item.points,
            created_at: item.createdAt,
          }));
          setUserActivities((prevUserActivity: UserActivities) => ({
            ...prevUserActivity,
            activities: transformedActivities
          }));
        } else {
          console.error('Follow check failed:', data)
        }
      } catch (err) {
        console.error('Follow check error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (popup) {
      const handlePopupClose = () => {
        checkFollowStatus();
      };

      popup.onbeforeunload = handlePopupClose;

      return () => {
        if (popup) {
          popup.onbeforeunload = null;
        }
      };
    }
  }, [popup])

  const twitterLogin = () => {
    setLoading(true)
    setIsTweetOpen(true)
  }

  const handleTweet = (username: string) => {
    setUserData(prev => ({
      ...prev,
      twitterId: username,
    }))
    setIsTweetOpen(false);
    twitterFollow();
  }

  const closeTweetModal = () => {
    setIsTweetOpen(false)
    setLoading(false)
  }

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks`);
      const data = await tasks.json();
      setTasks(data.tasks);
    }
    fetchTasks();
  }, []);

  return (
    <main className="w-full min-h-screen bg-bgMain font-aeonik text-[#878787] homeBackground">
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
            <div className="bg-gradient-to-b from-[#202020] to-[#272727] p-[1px] rounded-[20px]">
              {
                tasks && tasks.map((task: Task) => {
                  if (task.type != typeTask) {
                    return null;
                  }
                  return (
                    <div className="rounded-[19px] bg-[#101010] px-4 py-4 flex items-stretch justify-between" key={task._id}>
                      <div className="flex flex-col justify-between">
                        <p className="text-[#FFFFFF] text-base font-medium">{task.title}</p>
                        <div className="flex items-center justify-start gap-1">
                          {
                            (loading) ? (
                              <p className="text-xs text-[#878787] ">Loading...</p>
                            ) : userData.followStatus || userData.tasks.some((t: Task) => t._id === task._id) ? (
                              <>
                                <p className="text-xs text-[#878787] ">Completed</p>
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#07D7C2]"></div>
                              </>
                            ) : (
                              userData?.twitterId ? (
                                <button
                                  onClick={twitterFollow}
                                  className="w-[54px] h-[23px] bg-[#FFFFFF] rounded-full flex items-center justify-center text-base font-medium text-[#010101] border-none focus:outline-none"
                                >
                                  Follow
                                </button>
                              ) :
                                (
                                  <>
                                    <button
                                      onClick={twitterLogin}
                                      className="w-[54px] h-[23px] bg-[#FFFFFF] rounded-full flex items-center justify-center text-base font-medium text-[#010101] border-none focus:outline-none"
                                    >
                                      Start
                                    </button>
                                  </>
                                )
                            )
                          }
                        </div>
                      </div>
                      <div className="p-[1px] bg-gradient-to-b from-[#101010] to-[#FFFFFF] via-[#444444] rounded-full">
                        <div className="relative p-6 rounded-full bg-gradient-to-b from-[#101010] to-[#585858] via-[#1b1b1b]">
                          <Image src="/images/points.png" className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-9 h-auto" width={36} height={36} alt="points" />
                          <div className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                            <span className="font-bold leading-none text-[#FFFFFF] text-base ">
                              {task.points}
                            </span>
                            <span className="font-medium leading-none text-[#FFFFFF] text-[11px]">
                              Points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
      {isOpen && <Modal closeModal={() => setIsOpen(false)} earned={earned} />}
      {isTweetOpen && <TweetModal closeModal={closeTweetModal} handleTweet={handleTweet} />}
    </main >
  );
};

export default Tasks;  