import db from "@/app/database/db";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ITask } from "./interface";
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
    static async initiateOrFetchUser(data: { user_id: string, referCode: string }) {
        const { user_id, referCode } = data;

        if (!user_id)
            return { message: "User Id is required", success: false };

        let user;
        const existingUser = await User.findOne({ user_id })
            .populate("referredBy")
            .populate("tasks")
            .populate("achieveTasks");
        if (!existingUser) {
            const newReferralCode = UserController.generateReferralCode();
            const newUser = await User.create({
                user_id: user_id || ``,
                referral_code: newReferralCode,
                points: 0,
                level: 0,
                maxReferralDepth: process.env.MAX_REFERRAL_DEPTH,
                twitterId: null,
                tasks: [],
                achieveTasks: []
            });

            user = await User.findOne({ user_id: newUser.user_id })
                .populate("referredBy")
                .populate("tasks")
        } else {
            user = existingUser;
        }
        if (referCode && !existingUser) {
            const referrer = await User.findOne({ referral_code: referCode });
            if (referrer) {
                console.log("referrer: ", referrer);
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
                referral_code: user.referral_code,
                tasks: user.tasks,
                achieveTasks: user.achieveTasks
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
        if (!newUser._id) {
            console.error("New user does not have an ID.");
            return;
        }
        if (newUser.referredBy) return;

        try {
            const referralChain: UserDocument[] = [];
            let currentReferrer: UserDocument | null = referrer;

            while (
                currentReferrer &&
                referralChain.length < currentReferrer.maxReferralDepth
            ) {
                referralChain.push(currentReferrer);
                currentReferrer = await User.findById(currentReferrer.referredBy);
            }
            console.log("referralChain: ", referralChain.length);

            for (let level = 0; level < referralChain.length; level++) {
                const points = UserController.calculatePoints(level);
                referralChain[level].points += points;
                referralChain[level].level = UserController.calculateRank(
                    referralChain[level].points
                );
                referralChain[level].referralCount += 1;

                await Activity.create({
                    user: referralChain[level]._id,
                    rewarded_by: newUser._id,
                    type: "REFERRAL",
                    referral_code: referrer.referral_code,
                    points,
                });

                await referralChain[level].save();
            }

            newUser.points += 5;
            newUser.referredBy = referrer._id;
            await newUser.save();

            const updatedNewUser = await User.findById(newUser._id);

            await Activity.create({
                user: updatedNewUser._id,
                rewarded_by: referrer._id,
                type: "REFERRAL",
                referral_code: referrer.referral_code,
                points: 5,
            });
        } catch (error) {
            console.log("Activity Creation error:", error);
        }
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

    static async fetchTwitterIdfromUsername(username: string) {
        console.log("username", username);
        const twitterUrl = `https://api.socialdata.tools/twitter/user/${username}`;
        const apiKey = process.env.SOCIALDATA_API_KEY;
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
        }
        const response = await axios.get(twitterUrl, { headers });
        return response.data.id_str;
    }

    static async registerTwitterId(data: { twitterId: string, telegramId: string }) {
        let twitterId = data.twitterId;
        const telegramId = data.telegramId;
        if (!Number(twitterId)) {
            try {
                twitterId = UserController.extractTwitterId(twitterId);
                console.log("twitterId", twitterId);
                const twitterUrl = `https://api.socialdata.tools/twitter/user/${twitterId}`;
                const apiKey = process.env.SOCIALDATA_API_KEY;
                const headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                }
                const response = await axios.get(twitterUrl, { headers });
                twitterId = response.data.id;
                console.log("twitterId", twitterId);
            } catch (error) {
                console.error("Error extracting Twitter ID:", error);
                return { error: 'Invalid Twitter ID' };
            }
        }
        const existingTwitter = await User.findOne({ twitterId });
        if (existingTwitter) {
            return { error: 'This twitter is already used' };
        }
        const user = await User.findOne({ user_id: telegramId });
        if (!user) {
            return { error: 'User is not registered' };
        }

        const updatedUser = await User.findOneAndUpdate(
            { user_id: telegramId },
            { $set: { twitterId } },
            { new: true }
        );
        return { success: true, user: updatedUser };
    }

    static async followTarget(data: { targetUserId: string, loggedInUserId: string, telegramId: string, taskId: string }) {
        try {
            const { targetUserId, telegramId, taskId } = data;
            let loggedInUserId = data.loggedInUserId;
            const apiKey = process.env.SOCIALDATA_API_KEY;
            console.log("loggedInUserId", loggedInUserId);
            const existingUser = await User.findOne({ user_id: telegramId });
            if (!existingUser) {
                console.log('User is not registered');
                return { error: 'User is not registered' };
            } else {
                if (existingUser.tasks.includes(taskId)) {
                    console.log('User is already followed');
                    return { error: 'User is already followed' };
                }
            }
            if (!Number(loggedInUserId)) {
                try {
                    loggedInUserId = UserController.extractTwitterId(loggedInUserId);
                    console.log("loggedInUserId", loggedInUserId);
                    const twitterUrl = `https://api.socialdata.tools/twitter/user/${loggedInUserId}`;
                    const headers = {
                        'Authorization': `Bearer ${apiKey}`,
                        'Accept': 'application/json',
                    }
                    const response = await axios.get(twitterUrl, { headers });
                    loggedInUserId = response.data.id;
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
                console.log("response:", response.data);
                if (response.data.status === 'success' && response.data.is_following) {
                    const task = await Task.findOne({ _id: taskId });
                    if (!task) {
                        console.error("Task not found");
                        return { error: 'Task not found' };
                    }
                    const existingUser = await User.findOne({ user_id: telegramId })
                        .populate("achieveTasks")
                        .populate("referredBy")
                        .populate("tasks");
                    existingUser.followStatus = true;
                    existingUser.targetId = targetUserId;
                    existingUser.twitterId = loggedInUserId;
                    existingUser.points = existingUser.points + task.points;
                    existingUser.level = UserController.calculateRank(existingUser.points);
                    existingUser.tasks.push(task);
                    existingUser.save();

                    await Activity.create(
                        {
                            user: existingUser,
                            rewarded_by: null,
                            type: "TASK",
                            referral_code: null,
                            points: task.points,
                        }
                    );

                    const activities = await Activity.find({ user: existingUser._id })
                        .populate({ path: "user", select: "-_id user_id" })
                        .populate({ path: "rewarded_by", select: "-_id user_id" })
                        .select("-_id");

                    const level = await Level.find({ level_id: existingUser.level });

                    return {
                        success: true, 
                        activity: activities, 
                        user: existingUser, 
                        level: {
                            current_level: level[0]?.level_id || 0,
                            min: level[0]?.min || 0,
                            max: level[0]?.max || 0,
                        },
                    };
                } else {
                    return { error: 'Failed to verify follow status' };
                }
            } catch (error) {
                console.log('SocialData API Error:', error);
                return { error: 'SocialData API error' };
            }
        } catch (error) {
            console.error('Error:', error);
            return { error: 'Internal server error' };
        }
    }

    static async getTasks() {
        const tasks = await Task.find().sort('-createdAt');
        return tasks;
    }

    static async saveTask(task: ITask) {
        if (!task._id) {
            const taskData = {
                title: task.title,
                type: task.type!,
                points: task.points,
                index: task.index,
                method: task.method!,
                target: task.target,
            }
            if (!["once", "daily"].includes(taskData.type)) {
                throw new Error(`Invalid type: ${taskData.type}`);
            }
            if (!["twitter_follow"].includes(taskData.method)) {
                throw new Error(`Invalid method: ${taskData.method}`);
            }
            try {
                const title = UserController.extractTwitterId(taskData.title);
                taskData.target = await UserController.fetchTwitterIdfromUsername(title);
                const existingTask = await Task.findOne({ target: taskData.target });
                if (existingTask) {
                    throw new Error('This Twitter Task already exists');
                }

                await Task.create(taskData);
                return UserController.getTasks();
            } catch (error) {
                console.log(error);
                throw new Error('Failed to save task');
            }
        } else {
            try {
                const existingTask = await Task.findOne({ _id: task._id });
                if (!existingTask) {
                    throw new Error('Task not found');
                }
                if (existingTask.title != task.title) {
                    const title = UserController.extractTwitterId(task.title);
                    task.target = await UserController.fetchTwitterIdfromUsername(title);
                    const existingTask = await Task.findOne({ target: task.target, _id: { $ne: task._id } });
                    if (existingTask) {
                        throw new Error('This Twitter Task already exists');
                    }
                }
                await Task.findOneAndUpdate({ _id: task._id }, { $set: task }, { new: true });
                return UserController.getTasks();
            } catch (error) {
                console.log(error);
                throw new Error('Failed to update task');
            }
        }
    }

    static async deleteTask(id: string) {
        await Task.findOneAndDelete({ _id: id });
        return UserController.getTasks();
    }

    static async achieveTask(taskId: string, telegramId: string) {
        const task = await Task.findOne({ _id: taskId });
        if (!task) {
            return { error: 'Task not found' };
        }
        const user = await User.findOneAndUpdate(
            { user_id: telegramId },
            {
                $push: { achieveTasks: task }
            },
            { new: true }
        ).populate("referredBy")
            .populate("tasks")
            .populate("achieveTasks");
        return { success: true, user: user };
    }
}

export default UserController;
