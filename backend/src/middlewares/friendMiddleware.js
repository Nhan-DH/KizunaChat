import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';

const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();

        const recipientId = req.body?.recipientId ?? null;

        const memberIds = req.body?.memberIds ?? [];

        if (!recipientId && memberIds.length === 0) {
            return res.status(400).json({ message: "recipientId is required hoac memberIds" });
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

        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = pair(me, memberId);
            const isFriend = await Friend.findOne({ userA, userB });
            return isFriend ? null : memberId;

        })
        const result = await Promise.all(friendChecks);
        const notFriends = result.filter(id => id !== null);

        if (notFriends.length > 0) {
            return res.status(403).json({ message: "Bạn chỉ có thể thêm bạn bè của mình vào cuộc trò chuyện nhóm", notFriends });
        }
        next();

    }
    catch (error) {
        console.error("Lỗi khi kiểm tra tình bạn trong friendMiddleware", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const checkGroupMembership = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
        }
        if (conversation.type !== 'group') {
            return res.status(400).json({ message: "Cuộc trò chuyện không phải là nhóm" });
        }
        const isMember = conversation.participants.some(p => p.userId.toString() === userId.toString());

        if (!isMember) {
            return res.status(403).json({ message: "Bạn chỉ có thể gửi tin nhắn vào nhóm mà bạn là thành viên" });
        }

        req.conversation = conversation;
        next();
    }
    catch (error) {
        console.error("Lỗi khi kiểm tra thành viên nhóm trong friendMiddleware", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}