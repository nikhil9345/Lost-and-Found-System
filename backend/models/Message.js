// const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema(
//   {
//     senderId: { type: String, required: true },
//     recipientId: { type: String, required: true },
//     text: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Message", MessageSchema);




// const mongoose = require("mongoose");

// const MessageSchema = mongoose.Schema(
//   {
//     message: {
//       text: { type: String, required: true },
//     },
//     users: Array,
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Message", MessageSchema);


const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: false, // Make text optional
            },
            file: {
                url: String,
                fileName: String,
                fileType: String,
            },
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: [true, "Users array is required"],
            validate: {
                validator: function (v) {
                    return v.length === 2;
                },
                message: "Users array must contain exactly 2 user IDs",
            },
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", MessageSchema);


