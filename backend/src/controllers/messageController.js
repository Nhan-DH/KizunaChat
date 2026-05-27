import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { updateConversationAfterCreateMessage } from '../utils/messageHelper.js';


export const sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content, conversationId } = req.body;
        const senderId = req.user._id;

        let conversation;
        if (!content) {
            return res.status(400).json({ message: "Nội dung tin nhắn không được để trống" });
        }
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }
        if (!conversationId) {
            conversation = await Conversation.create({
                type: 'direct',
                participants: [
                    { userId: senderId, joinedAt: new Date() },
                    { userId: recipientId, joinedAt: new Date() }
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map()
            });
        }
        const message = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            content,
            type: 'text'
        });
        updateConversationAfterCreateMessage(conversation, message, senderId);

        await conversation.save();

        res.status(201).json({ message: "Tin nhắn đã được gửi thành công", data: message });


    }

    catch (error) {
        console.error("co loi khi gui tin nhan truc tiep", error);
        res.status(500).json({ message: error.message });
    }
};
export const sendGroupMessage = async (req, res) => {
    try {
        const { content, conversationId } = req.body;
    }
    catch (error) {
        console.error("co loi khi gui tin nhan nhom", error);
        res.status(500).json({ message: error.message });
    }
};