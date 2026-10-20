require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find({
        $or: [
            { inviteCode: "" },
            { inviteCode: { $exists: false } }
        ]
    });

    for (const user of users) {
        let code;

        do {
            code = crypto.randomBytes(6).toString("hex").toUpperCase();
        } while (await User.exists({ inviteCode: code }));

        await User.updateOne(
            { _id: user._id, inviteCode: { $in: ["", null] } },
            { $set: { inviteCode: code } }
        );

        console.log("Updated user:", user._id.toString());
    }

    console.log("Migration completed.");
    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});