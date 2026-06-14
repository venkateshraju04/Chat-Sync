import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, Fragment } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatChatDate } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    }
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const handleFocus = () => {
      if (selectedUser && document.hasFocus() && document.visibilityState === "visible") {
        markMessagesAsRead(selectedUser._id);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [selectedUser, markMessagesAsRead]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const showDateDivider = index === 0 || 
            new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

          return (
            <Fragment key={message._id}>
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-base-300 text-base-content/70 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {formatChatDate(message.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                ref={messageEndRef}
              >
                <div className=" chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1 flex items-center gap-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                  {message.senderId === authUser._id && (
                    <span className="text-xs">
                      {message.isRead ? (
                        <span className="text-sky-400 font-bold ml-1" style={{ letterSpacing: "-0.2em" }}>✓✓</span>
                      ) : (
                        <span className="text-zinc-500 ml-1">✓</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;