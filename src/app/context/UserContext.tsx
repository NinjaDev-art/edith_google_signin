'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk"
import { Activity, UserActivities, IUserData, UserProfile, UserContextTypes } from "../lib/interface";

const UserContext = createContext<UserContextTypes | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    let data = {
        user_id: 6947417004,
        referCode: "",
        firstName: "John",
        lastName: "",
        username: "johndoe",
        photoUrl: "/images/avatar.png",
    }
    const [userProfile, setUserProfile] = useState<UserProfile>({
        fullname: "",
        username: "",
        photoUrl: "",
    });
    const [userData, setUserData] = useState<IUserData>({
        user_id: '',
        level: 0,
        max: 0,
        min: 0,
        points: 0,
        twitterId: null,
        targetId: null,
        referCode: null,
        followStatus: false,
        achieveTasks: [],
        tasks: [],
    });
    const [userActivities, setUserActivities] = useState<UserActivities>({
        referralCode: "",
        activities: [],
        maxReferralDepth: 0,
        referralCount: 0,
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (process.env.FAKE_USER !== "1") {
                try {
                    const { initData, startParam } = retrieveLaunchParams();
                    data = {
                        user_id: initData?.user?.id || 6995859320,
                        referCode: startParam !== undefined ? startParam : "",
                        firstName: initData?.user?.firstName || "John",
                        lastName: initData?.user?.lastName || "Doe",
                        username: initData?.user?.username || "johndoe",
                        photoUrl: initData?.user?.photoUrl || "/images/avatar.png"
                    }
                } catch (error) {
                    console.log("Error", error);
                }
            }
    
            setUserProfile({
                fullname: data.firstName + " " + data.lastName,
                username: data.username,
                photoUrl: data.photoUrl
            });
    
            await fetch(`${process.env.NEXTAUTH_URL}/api/userData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then(async (response) => {
                    console.log(response)
                    const data = await response.json();
                    if (data.success) {
                        setUserData({
                            level: Number(data.level.current_level) ?? 0,
                            max: Number(data.level.max) ?? 0,
                            min: Number(data.level.min) ?? 0,
                            points: data.user.points ?? 0,
                            user_id: data.user.user_id ?? 0,
                            twitterId: data.user.twitterId ?? "",
                            targetId: data.user.targetId ?? "",
                            followStatus: data.user.followStatus ?? false,
                            referCode: data.user.referral_code ?? "",
                            achieveTasks: data.user.achieveTasks ?? [],
                            tasks: data.user.tasks ?? [],
                        });
                    }
                })
                .catch((error) => {
                    console.log("Error", error);
                });
    
            await fetch(`${process.env.NEXTAUTH_URL}/api/userActivities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then(async (response) => {
                    console.log(response)
                    const data = await response.json();
                    if (data.success) {
                        const activityData = Array.isArray(data.activities) ? data.activities : [];
    
                        const transformedActivities: Activity[] = activityData.map((item: { rewarded_by: { user_id: string }; type: string; referral_code: string; points: number; createdAt: string; }) => ({
                            rewarded_user_id: item.rewarded_by?.user_id,
                            type: item.type,
                            referral_code: item.referral_code,
                            points: item.points,
                            created_at: item.createdAt,
                        }));
    
                        setUserActivities({
                            referralCode: data.user.referral_code,
                            activities: transformedActivities,
                            maxReferralDepth: data.user.maxReferralDepth,
                            referralCount: data.user.referralCount,
                        });
                    }
                })
                .catch((error) => {
                    console.log("Error", error);
                });
        };
        
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ userProfile, userData, userActivities, setUserData, setUserActivities }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}