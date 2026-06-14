import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, MessageSquare, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    getGroups,
    groups,
    selectedGroup,
    setSelectedGroup,
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups"
  const [showOnlineOnly, setOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "chats") {
      getUsers();
    } else {
      getGroups();
    }
  }, [activeTab, getUsers, getGroups]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = !showOnlineOnly || onlineUsers.includes(user._id);
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesOnline && matchesSearch;
  });

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        {/* Toggle between Chats and Groups */}
        <div className="flex p-1 bg-base-200/50 rounded-xl gap-1 mb-4">
          <button
            onClick={() => {
              setActiveTab("chats");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "chats"
                ? "bg-primary text-primary-content shadow-sm animate-in fade-in duration-200"
                : "hover:bg-base-300/50 text-base-content/70"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span className="hidden lg:block">Chats</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("groups");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "groups"
                ? "bg-primary text-primary-content shadow-sm animate-in fade-in duration-200"
                : "hover:bg-base-300/50 text-base-content/70"
            }`}
          >
            <Users className="size-3.5" />
            <span className="hidden lg:block">Groups</span>
          </button>
        </div>

        {/* Contacts Header or Group Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === "chats" ? <Users className="size-5" /> : <Users className="size-5" />}
            <span className="font-medium hidden lg:block">
              {activeTab === "chats" ? "Contacts" : "Groups"}
            </span>
          </div>
        </div>

        {activeTab === "chats" && (
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
        )}

        {/* Search Input */}
        <div className="mt-4 relative hidden lg:block">
          <input
            type="text"
            placeholder={activeTab === "chats" ? "Search contacts..." : "Search groups..."}
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

      <div className="overflow-y-auto w-full py-3 px-2 flex-1 space-y-1">
        {/* Create Group Button for Groups tab */}
        {activeTab === "groups" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all font-semibold text-sm border border-primary/20 justify-center lg:justify-start cursor-pointer mb-2"
          >
            <Plus className="size-5" />
            <span className="hidden lg:block">Create Group</span>
          </button>
        )}

        {/* Chats rendering */}
        {activeTab === "chats" &&
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3 rounded-xl cursor-pointer
                hover:bg-base-300/50 transition-all duration-200
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
                  <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100 lg:hidden animate-bounce">
                    {user.unreadCount > 4 ? "4+" : user.unreadCount}
                  </span>
                )}
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
                <div className="text-left min-w-0">
                  <div className="font-semibold truncate">{user.fullName}</div>
                  <div className="text-xs text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
                {user.unreadCount > 0 && (
                  <span className="bg-primary text-primary-content text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm animate-pulse">
                    {user.unreadCount > 4 ? "4+" : user.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}

        {/* Groups rendering */}
        {activeTab === "groups" &&
          filteredGroups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`
                w-full p-3 flex items-center gap-3 rounded-xl cursor-pointer
                hover:bg-base-300/50 transition-all duration-200
                ${
                  selectedGroup?._id === group._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                {group.groupPic ? (
                  <img
                    src={group.groupPic}
                    alt={group.name}
                    className="size-12 object-cover rounded-full"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/20">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:flex flex-1 flex-col items-start min-w-0">
                <div className="font-semibold truncate w-full text-left">{group.name}</div>
                <div className="text-xs text-zinc-400 truncate w-full text-left">
                  {group.members?.length || 0} members
                </div>
              </div>
            </button>
          ))}

        {activeTab === "chats" && filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-8 hidden lg:block">
            No contacts found
          </div>
        )}

        {activeTab === "groups" && filteredGroups.length === 0 && (
          <div className="text-center text-zinc-500 py-8 hidden lg:block">
            No groups found
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;
