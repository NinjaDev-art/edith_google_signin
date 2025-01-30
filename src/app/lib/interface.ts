export interface UserContextTypes {
    userProfile: UserProfile;
    userData: IUserData;
    userActivities: UserActivities;
    setUserData: React.Dispatch<React.SetStateAction<IUserData>>;
    setUserActivities: React.Dispatch<React.SetStateAction<UserActivities>>;
}

export interface UserProfile {
    fullname: string;
    username?: string;
    photoUrl?: string;
}

export interface IUserData {
    user_id: string;
    level: number;
    max: number;
    min: number;
    points: number;
    twitterId: string | null;
    targetId: string | null;
    referCode: string | null;
    followStatus: boolean;
    achieveTasks: ITask[];
    tasks: ITask[];
}

export interface UserActivities {
    activities: Activity[];
    referralCode: string;
    maxReferralDepth: number;
    referralCount: number;
}

export interface Activity {
    rewarded_user_id: string;
    type: string;
    referral_code: string;
    points: number;
    created_at: string;
}

export interface ITask {
    _id: string;
    title: string;
    type?: "once" | "daily";
    points: number;
    index: string;
    method: "twitter_flow";
    target: string;
}