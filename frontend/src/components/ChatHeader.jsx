import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isGroup = !!selectedGroup;
  const activeChat = selectedGroup || selectedUser;

  if (!activeChat) return null;

  const isTyping = !isGroup && typingUsers[selectedUser._id];

  const handleClose = () => {
    if (isGroup) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  const getSubtitle = () => {
    if (isGroup) {
      const names = activeChat.members?.map((m) => m.fullName).join(", ");
      return (
        <span className="truncate max-w-[200px] sm:max-w-md text-base-content/50 block">
          {names || `${activeChat.members?.length || 0} members`}
        </span>
      );
    }
    return isTyping ? (
      <span className="text-emerald-500 font-medium flex items-center gap-1 animate-pulse">
        typing
        <span className="flex gap-1 items-center mt-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
        </span>
      </span>
    ) : (
      onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
    );
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative overflow-hidden">
              {isGroup ? (
                activeChat.groupPic ? (
                  <img src={activeChat.groupPic} alt={activeChat.name} className="object-cover size-full" />
                ) : (
                  <div className="size-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <img src={activeChat.profilePic || "/avatar.png"} alt={activeChat.fullName} className="object-cover size-full" />
              )}
            </div>
          </div>

          {/* Chat info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {isGroup ? activeChat.name : activeChat.fullName}
            </h3>
            <p className="text-xs text-base-content/70 flex items-center gap-1 min-h-[16px] min-w-0">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={handleClose} className="cursor-pointer hover:opacity-75 transition-opacity">
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;