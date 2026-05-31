export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId
) => {
  // Gán trực tiếp thay vì dùng .set() để preserve nested fields (group)
  conversation.seenBy = [];
  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessage = {
    _id: message._id.toString(), // Convert to String vì schema định nghĩa như vậy
    content: message.content,
    senderId,
    createdAt: message.createdAt,
  };

  // Báo cho Mongoose biết các nested fields đã thay đổi
  conversation.markModified('lastMessage');
  conversation.markModified('seenBy');

  // Nếu là group, đảm bảo group field tồn tại
  if (conversation.type === 'group' && !conversation.group) {
    conversation.group = {};
  }

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });

  conversation.markModified('unreadCounts');
};
export const emitNewMessage = (io, conversation, message) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  });
};