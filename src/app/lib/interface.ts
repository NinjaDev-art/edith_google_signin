export interface UserContextTypes {
    userProfile: UserProfile;
    userData: UserData;
    userActivities: UserActivities;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export interface UserProfile {
    fullname: string;
    username?: string;
    photoUrl?: string;
}

export interface UserData {
    user_id: string;
    level: number;
    max: number;
    min: number;
    points: number;
    twitterId: string | null;
    targetId: string | null;
    referCode: string | null;
    followStatus: boolean;
    tasks: Task[];
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

export interface Task {
    _id: string;
    title: string;
    type: string;
    points: number;
    index: number;
}