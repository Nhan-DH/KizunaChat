import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages } = useChatStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user._id];
  const name = convo.group?.name || "Unnamed Group";
  // const lastMessage = convo.lastMessage?.content ?? "";
  const handleSelectConvesation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      // await fetchMessages(id);
    }
  }

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={convo.lastMessage?.createdAt ? new Date(convo.lastMessage.createdAt) : undefined}
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConvesation}
      unreadCount={unreadCount}
      leftSection={
        <></>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0 && "font-medium text-foreground",
            unreadCount === 0 && "text-muted-foreground"
          )}
        >
          {convo.participants.length} members
        </p>
      }
    />
  );
};

export default GroupChatCard;
