import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
  const { conversations, loading } = useChatStore();

  // Lọc chỉ các cuộc trò chuyện direct
  const directConversations = conversations.filter(
    (convo) => convo.type === "direct"
  );

  // Nếu đang tải
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  // Nếu không có direct conversation nào
  if (directConversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Không có cuộc trò chuyện nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (

        <DirectMessageCard
          convo={convo}
          key={convo._id}
        />
      ))}
    </div>
  );
};

export default DirectMessageList;