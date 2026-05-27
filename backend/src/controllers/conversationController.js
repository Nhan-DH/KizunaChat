import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const createConversation = async (req, res) => {
    try {
        const { type, name, memberIds } = req.body;
        const userId = req.user._id;
        if (!type ||
            (type === 'group' && !name) ||
            !memberIds ||
            !Array.isArray(memberIds) ||
            memberIds.length === 0) {
            return res.status(400).json({ message: "Ten nhom va du lieu thanh vien la bat buoc" });
        }
        let conversation;

        if (type === 'direct') {
            const participantId = memberIds[0];

            conversation = await Conversation.findOne({
                type: 'direct',
                "participants.userId": { $all: [userId, participantId] },
            });
            if (!conversation) {
                conversation = new Conversation({
                    type: 'direct',
                    participants: [
                        { userId },
                        { userId: participantId }
                    ],
                    lastMessageAt: new Date(),
                });

                await conversation.save();
            }
        }

        if (type === 'group') {
            conversation = new Conversation({
                type: 'group',
                name,
                participants: [
                    { userId },
                    ...memberIds.map(id => ({ userId: id }))
                ],
                lastMessageAt: new Date(),
            });

            await conversation.save();
        }
        if (!conversation) {
            return res.status(400).json({ message: "Khong the tao cuoc tro chuyen" });
        }

        await conversation.populate(
            [
                { path: 'participants.userId', select: 'username avatarUrl' },
                { path: 'seenBy', select: 'username avatarUrl' },
                { path: 'lastMessage.senderId', select: 'username avatarUrl' }
            ]
        );

        return res.status(201).json({ message: "Cuoc tro chuyen da duoc tao thanh cong", data: conversation });
    }
    catch (error) {
        console.error("co loi khi tao cuoc tro chuyen", error);
        res.status(500).json({ message: error.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            "participants.userId": userId
        })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .populate([
                { path: 'seenBy', select: 'username avatarUrl' },

            ]);

        const formatted = conversations.map((conv) => {
            const participants = (conv.participants || []).map(p => ({
                _id: p.userId._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt,
            }));
            return {
                ...conv.toObject(),
                unreadCounts: conv.unreadCounts || {},
                participants,
            }
        })
        return res.status(200).json({ message: "Danh sach cuoc tro chuyen", data: formatted });
    }

    catch (error) {
        console.error("co loi khi lay conversation", error);
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 20, cursor } = req.query;

        const query = { conversationId };
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) + 1);

        let nextCursor = null;

        if (messages.length > Number(limit)) {
            const nextMessage = messages[messages.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            messages.pop();
        }
        messages = messages.reverse();



        return res.status(200).json({ message: "Danh sach tin nhan", data: messages });
    }
    catch (error) {
        console.error("co loi khi lay tin nhan", error);
        res.status(500).json({ message: error.message });
    }
};