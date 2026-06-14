import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = !showOnlineOnly || onlineUsers.includes(user._id);
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesOnline && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
        {/* Search Input */}
        <div className="mt-4 relative hidden lg:block">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 pr-8 rounded-lg text-sm bg-base-200/50 focus:bg-base-200 transition-all duration-150"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-error transition-colors"
            >
              <X className="size-4 text-base-content/40" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {/* Mobile unread badge */}
              {user.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100 lg:hidden">
                  {user.unreadCount > 4 ? "4+" : user.unreadCount}
                </span>
              )}
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
              {user.unreadCount > 0 && (
                <span className="bg-primary text-primary-content text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm">
                  {user.unreadCount > 4 ? "4+" : user.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-8 hidden lg:block">
            No contacts found
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
