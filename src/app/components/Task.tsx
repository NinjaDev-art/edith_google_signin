import { useState, Dispatch, SetStateAction } from "react";
import { ITask, IUserData, UserActivities, Activity } from "@/app/lib/interface";
import TweetModal from "@/app/components/TweetModal";
import Image from "next/image";

interface TaskProps {
    task: ITask;
    userData: IUserData;
    setUserData: Dispatch<SetStateAction<IUserData>>;
    setUserActivities: Dispatch<SetStateAction<UserActivities>>;
    setEarned: Dispatch<SetStateAction<number>>;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Task = ({ task, userData, setUserData, setUserActivities, setEarned, setIsOpen }: TaskProps) => {
    const [loading, setLoading] = useState(false);
    const [isTweetOpen, setIsTweetOpen] = useState(false);
    const [error, setError] = useState('');
    const [isTweetLoading, setIsTweetLoading] = useState(false);
    const [, setPopup] = useState<Window | null>(null);

    const twitterFollow = () => {
        setLoading(true)
        const followUrl = `https://twitter.com/intent/follow?user_id=${process.env.TWITTER_USER_ID}`
        achieveTask();
        const newPopup = window.open(followUrl, 'Follow', 'width=600,height=400');
        if (!newPopup) {
            setLoading(false)
            alert('Please allow popups to follow on Twitter')
            return
        }
        setPopup(newPopup)
    }

    const checkFollowStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/userFollow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUserId: process.env.TWITTER_USER_ID,
                    loggedInUserId: userData?.twitterId,
                    telegramId: userData?.user_id,
                    taskId: task._id
                })
            })
            const data = await response.json();

            // Handle both 200 and 201 status codes
            if (data.success) {
                setUserData({
                    ...data.user, 
                    level: Number(data.level.current_level) ?? 0,
                    max: Number(data.level.max) ?? 0,
                    min: Number(data.level.min) ?? 0
                });
                setEarned(task.points);
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
                console.log('Follow check failed:', data)
                throw new Error('Follow check failed')
            }
        } catch (err) {
            console.log('Follow check error:', err)
            if (userData.tasks.find((task: ITask) => task.method == "twitter_follow")) {
                twitterFollow();
            } else {
                twitterLogin();
            }
        } finally {
            setLoading(false)
        }
    }

    const twitterLogin = () => {
        setLoading(true)
        setIsTweetOpen(true)
    }

    const closeTweetModal = () => {
        setIsTweetOpen(false)
        setLoading(false)
    }

    const handleTweet = async (username: string) => {
        setIsTweetLoading(true);
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/registerTwitterId`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                twitterId: username,
                telegramId: userData?.user_id,
                taskId: task._id
            })
        })
        const data = await response.json();
        if (data.success) {
            setUserData(data.user);
            setIsTweetOpen(false);
            twitterFollow();
        } else {
            setError(data.message);
        }
        setIsTweetLoading(false);
    }

    const achieveTask = async () => {
        setLoading(true);
        try {
            if (!userData.achieveTasks.some((t: ITask) => t._id === task._id)) {
                const response = await fetch(`${process.env.NEXTAUTH_URL}/api/userTasks/achieveTask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        taskId: task._id,
                        telegramId: userData?.user_id
                    })
                })
                const data = await response.json();
                if (data.success) {
                    setUserData(data.user);
                } else {
                    throw new Error(data.error);
                }
            }
        } catch (error) {
            console.log('Achieve task error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="bg-gradient-to-b from-[#202020] to-[#272727] p-[1px] rounded-[20px]">
                <div className="rounded-[19px] bg-[#101010] px-4 py-4 flex items-stretch justify-between" key={task._id}>
                    <div className="flex flex-col justify-between">
                        <p className="text-[#FFFFFF] text-base font-medium">{task.method == 'twitter_follow' ? `Follow ${task.title} on Twitter` : task.title}</p>
                        <div className="flex items-center justify-start gap-1">
                            {
                                (loading) ? (
                                    <p className="text-xs text-[#878787] ">Loading...</p>
                                ) : userData.followStatus || userData.tasks.some((t: ITask) => t._id === task._id) ? (
                                    <>
                                        <p className="text-xs text-[#878787] ">Completed</p>
                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[#07D7C2]"></div>
                                    </>
                                ) : (
                                    userData?.twitterId ? (
                                        userData.achieveTasks.some((t: ITask) => t._id === task._id) ? (
                                            <button
                                                onClick={checkFollowStatus}
                                                className="px-4 h-[23px] bg-[#FFFFFF] rounded-full flex items-center justify-center text-base font-medium text-[#010101] border-none focus:outline-none"
                                            >
                                                Confirm
                                            </button>
                                        ) : (
                                            <button
                                                onClick={twitterFollow}
                                                className="px-4 h-[23px] bg-[#FFFFFF] rounded-full flex items-center justify-center text-base font-medium text-[#010101] border-none focus:outline-none"
                                            >
                                                Start
                                            </button>
                                        )
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
            </div>
            {isTweetOpen && <TweetModal closeModal={closeTweetModal} handleTweet={handleTweet} error={error} setError={setError} isTweetLoading={isTweetLoading} />}
        </>
    )
}

export default Task;