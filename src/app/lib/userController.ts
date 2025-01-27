import db from "@/app/database/db";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const { User, Activity, Level, Task } = db;

// Add this interface before the UserController class
interface UserDocument {
    referredBy: string | UserDocument;
    maxReferralDepth: number;
    points: number;
    level: number;
    referralCount: number;
    referral_code: string;
    save(): Promise<UserDocument>;
    _id: string;
}

class UserController {
    static generateReferralCode() {
        return uuidv4().replace(/-/g, "").slice(0, 12).toUpperCase();
    }
    static async initiateOrFetchUser(data: { user_id: string, refer_code: string }) {
        const { user_id, refer_code } = data;

        if (!user_id)
            return { message: "User Id is required", success: false };

        let user;
        const existingUser = await User.findOne({ user_id })
            .populate("referredBy")
            .populate("tasks")
            .select("-_id");
        if (!existingUser) {
            const newReferralCode = UserController.generateReferralCode();
            const newUser = await User.create({
                user_id: user_id || ``,
                referral_code: newReferralCode,
                points: 0,
                level: 0,
                maxReferralDepth: process.env.MAX_REFERRAL_DEPTH,
                twitterId: null,
                targetId: null,
                followStatus: false,
                tasks: [],
            });

            user = await User.findOne({ user_id: newUser.user_id })
                .populate("referredBy")
                .populate("task")
                .select("-id");
        } else {
            user = existingUser;
        }
        console.log(user);
        if (refer_code && !existingUser) {
            const referrer = await User.findOne({ referral_code: refer_code });
            if (referrer) {
                console.log(referrer);
                await UserController.processReferral(user, referrer);
            }
        }

        const activities = await Activity.find({ user: user._id })
            .populate({ path: "user", select: "-_id user_id" })
            .populate({ path: "rewarded_by", select: "-_id user_id" })
            .select("-_id");

        const level = await Level.find({ level_id: user.level });

        return {
            user: {
                user_id: user.user_id,
                referredBy: user.referredBy?.user_id,
                level: user.level,
                points: user.points,
                activities: activities,
                twitterId: user.twitterId,
                targetId: user.targetId,
                followStatus: user.followStatus,
                referral_code: user.referral_code,
                tasks: user.tasks
            },
            level: {
                current_level: level[0]?.level_id || 0,
                min: level[0]?.min || 0,
                max: level[0]?.max || 0,
            },
            success: true,
        };
    }

    static async processReferral(newUser: UserDocument, referrer: UserDocument) {
        if (newUser.referredBy) return;

        const referralChain: UserDocument[] = [];
        let currentReferrer: UserDocument | null = referrer;

        while (
            currentReferrer &&
            referralChain.length < currentReferrer.maxReferralDepth
        ) {
            referralChain.push(currentReferrer);
            currentReferrer = await User.findById(currentReferrer.referredBy);
        }

        for (let level = 0; level < referralChain.length; level++) {
            const points = UserController.calculatePoints(level);
            referralChain[level].points += points;
            referralChain[level].level = UserController.calculateRank(
                referralChain[level].points
            );
            referralChain[level].referralCount += 1;

            await Activity.create({
                user: referralChain[level],
                rewarded_by: newUser,
                type: "REFERRAL",
                referral_code: referrer.referral_code,
                points,
            });

            await referralChain[level].save();
        }

        newUser.points += 5;
        newUser.referredBy = referrer;
        await newUser.save();

        await Activity.create({
            user: newUser,
            rewarded_by: referrer,
            type: "REFERRAL",
            referral_code: referrer.referral_code,
            points: 5,
        });
    }

    static calculatePoints(level: number) {
        return level === 0 ? 25 : 5 * 0.5 ** level;
    }

    static calculateRank(points: number) {
        let level;

        if (points < 1) {
            level = 0; // Initiate
        } else if (points < 500) {
            level = 1; // Disciple
        } else if (points < 2000) {
            level = 2; // Seeker
        } else if (points < 5000) {
            level = 3; // Adept
        } else if (points < 10000) {
            level = 4; // Vanguard
        } else if (points < 20000) {
            level = 5; // Luminary
        } else if (points < 35000) {
            level = 6; // Archon
        } else if (points < 50000) {
            level = 7; // Paragon
        } else if (points < 75000) {
            level = 8; // Sovereign
        } else {
            level = 9; // EDITH Overlord
        }

        return level; // Return the rank level
    }

    static async getReferralCode(data: { user_id: string }) {
        const { user_id } = data;

        const user = await User.findOne({ user_id });
        if (!user) {
            return { message: "User Not Found" };
        }

        return {
            referral_code: user.referral_code,
        };
    }

    static async getActivity(user_id: string) {
        const user = await User.findOne({ user_id });
        if (!user) {
            return { message: "User Not Found" };
        }
        console.log("user", user);
        const activities = await Activity.find({ user: user._id })
            .populate({ path: "user", select: "-_id user_id" })
            .populate({ path: "rewarded_by", select: "-_id user_id" })
            .select("-_id");

        return {
            success: true,
            user: user,
            activities: activities,
        };
    }

    static async initLevel() {
        const levelsData = [
            { level_id: "0", min: 0, max: 0 },
            { level_id: "1", min: 1, max: 499 },
            { level_id: "2", min: 500, max: 2000 },
            { level_id: "3", min: 2001, max: 5000 },
            { level_id: "4", min: 5001, max: 10000 },
            { level_id: "5", min: 10001, max: 20000 },
            { level_id: "6", min: 20001, max: 35000 },
            { level_id: "7", min: 35001, max: 50000 },
            { level_id: "8", min: 50001, max: 75000 },
            { level_id: "9", min: 75001, max: Infinity },
        ];

        const existingLevel = await Level.findOne();
        if (!existingLevel) {
            await Level.insertMany(levelsData);
            return { message: "Levels created successfully." };
        }
        return { message: "Levels already created." };
    }

    static extractTwitterId(loggedInUserId: string): string {
        // Check if the input is a URL
        const urlPattern = /https?:\/\/(?:www\.)?x\.com\/([^\/]+)/;
        const handlePattern = /@(\w+)/;

        let match = loggedInUserId.match(urlPattern);
        if (match) {
            return match[1];
        }

        // Check if the input is a handle
        match = loggedInUserId.match(handlePattern);
        if (match) {
            return match[1];
        }

        // If it's neither, return the original input
        return loggedInUserId;
    }

    static async followTarget(data: { targetUserId: string, loggedInUserId: string, telegramId: string }) {
        try {
            const { targetUserId, telegramId } = data;
            let loggedInUserId = data.loggedInUserId;
            const apiKey = process.env.SOCIALDATA_API_KEY;
            console.log("loggedInUserId", loggedInUserId);
            if (!Number(loggedInUserId)) {
                try {
                    loggedInUserId = UserController.extractTwitterId(loggedInUserId);
                    console.log("loggedInUserId", loggedInUserId);
                    const twitterUrl = `https://api.twitter.com/2/users/by/username/${loggedInUserId}`;
                    const headers = {
                        "User-Agent": "v2TweetLookupJS",
                        "authorization": `Bearer ${process.env.BEARER_TOKEN}`
                    }
                    const params = {
                        "user.fields": "profile_image_url,name"
                    }
                    const response = await axios.get(twitterUrl, { headers, params });
                    console.log("response", response);
                    loggedInUserId = response.data.data.id;
                    console.log("loggedInUserId", loggedInUserId);
                } catch (error) {
                    console.error("Error extracting Twitter ID:", error);
                }
            }
            console.log("targetUserId", targetUserId);
            const url = `https://api.socialdata.tools/twitter/user/${loggedInUserId}/following/${targetUserId}`;
            const headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            };

            try {
                const response = await axios.get(url, { headers });

                if (response.data.status === 'success' && response.data.is_following) {
                    const task = await Task.findOne({ index: 0 });
                    const user = await User.findOneAndUpdate(
                        { user_id: telegramId },
                        { $set: { followStatus: true, targetId: targetUserId, twitterId: loggedInUserId, tasks: [...task] } }
                    );
                    const activity = await Activity.create({
                        user: user,
                        rewarded_by: null,
                        type: "TASK",
                        referral_code: null,
                        points: task.points,
                    });

                    return { success: true, activity: activity, user: user };
                } else {
                    return { error: 'Failed to verify follow status' };
                }
            } catch (error) {
                console.error('SocialData API Error:', error);
                return { error: 'SocialData API error' };
            }
        } catch (error) {
            console.error('Error:', error);
            return { error: 'Internal server error' };
        }
    }

    static async getTasks() {
        const tasks = await Task.find();
        return tasks;
    }
}

export default UserController;
