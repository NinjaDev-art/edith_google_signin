import mongoose from "mongoose";

const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/edith-miniapp')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
mongoose.Promise = global.Promise;

const db = {
    User: userModel(),
    Level: levelModel(),
    Activity: activitiyModel(),
    Task: taskModel()
}

function userModel() {
    const UserSchema = new Schema({
        user_id: { type: String, required: true, unique: true },
        referral_code: { type: String, required: true, unique: true },
        referredBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        level: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        referralCount: { type: Number, default: 0 },
        maxReferralDepth: { type: Number, default: 5 },
        createdAt: { type: Date, default: Date.now },
        twitterId: { type: String, default: null },
        achieveTasks: { type: [Schema.Types.ObjectId], ref: "Task", default: [] },
        tasks: { type: [Schema.Types.ObjectId], ref: "Task", default: [] },
    });

    return mongoose.models.User || mongoose.model('User', UserSchema);
}

function levelModel() {
    const LevelSchema = new Schema({
        level_id: { type: String, required: true, unique: true },
        min: { type: String, required: true, unique: true },
        max: { type: String, required: true, unique: true },
        createdAt: { type: Date, default: Date.now },
    });

    return mongoose.models.Level || mongoose.model('Level', LevelSchema);
}

function activitiyModel() {
    const ActivitySchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        rewarded_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        type: { type: String, enum: ["REFERRAL", "TASK"], required: true },
        referral_code: { type: String },
        points: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
    });

    return mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
}

function taskModel() {
    const TaskSchema = new Schema({
        title: { type: String, required: true },
        type: { type: String, required: true },
        points: { type: Number, required: true },
        index: { type: String, required: true },
        method: { type: String, required: true },
        target: { type: String },
        createdAt: { type: Date, default: Date.now },
    });

    return mongoose.models.Task || mongoose.model('Task', TaskSchema);
}

export default db;
