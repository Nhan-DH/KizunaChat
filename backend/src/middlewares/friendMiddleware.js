import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';

const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();

        const recipientId = req.body?.recipientId ?? null;

        if (!recipientId) {
            return res.status(400).json({ message: "recipientId is required" });
        }

        if (recipientId) {
            const [userA, userB] = pair(me, recipientId);

            const isFriend = await Friend.findOne({ userA, userB });

            if (!isFriend) {
                return res.status(403).json({ message: "Bạn chỉ có thể gửi tin nhắn cho bạn bè của mình" });
            }

            return next();
        }
        // Nếu không có recipientId, có thể là tin nhắn nhóm, kiểm tra nếu người dùng là thành viên của cuộc trò chuy

        //todo : chat nhom



    }
    catch (error) {
        console.error("Lỗi khi kiểm tra tình bạn trong friendMiddleware", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};