import {create} from 'zustand';
import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios';
import { Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
export const useChatStore = create((set,get) => ({
    messages: [],
    users:[],
    selectedUsers:[],
    isUsersLoading: false,
    isMessagesLoading: false,
    typingUsers: {},
    groups: [],
    selectedGroup: null,
    isGroupsLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true});
        try{
            const res=await axiosInstance.get('/message/users');
            set({users: res.data});
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            set({isUsersLoading: false});
        }
    },
    getMessages: async (id, isGroup = false) => {
        set({isMessagesLoading:true});
        try {
            const url = isGroup ? `/message/group/${id}` : `/message/${id}`;
            const res=await axiosInstance.get(url);
            set({messages: res.data});
            if (!isGroup) {
                get().markMessagesAsRead(id);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isMessagesLoading:false});
        }
    },

    markMessagesAsRead: async (userId) => {
        try {
            await axiosInstance.put(`/message/read/${userId}`);
            const updatedMessages = get().messages.map((msg) => {
                const msgSenderIdStr = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
                if (msgSenderIdStr === userId) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });
            set({ messages: updatedMessages });
        } catch (error) {
            console.log("Error in markMessagesAsRead:", error.message);
        }
    },

    sendMessage: async (messageData)=>{
        const {selectedUser, selectedGroup, messages}=get();
        try {
            let res;
            if (selectedGroup) {
                res = await axiosInstance.post(`/message/send/${selectedGroup._id}?isGroup=true`, messageData);
            } else {
                res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            }
            set({messages: [...messages,res.data]});
            
            if (!selectedGroup) {
                get().updateUserPosition(selectedUser._id, res.data.createdAt || new Date());
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: ()=>{
        const socket=useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage",(newMessage)=>{
            const {selectedUser}=get();
            const senderIdStr = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;

            if(selectedUser && senderIdStr===selectedUser._id) {
                set({messages: [...get().messages,newMessage]});
                
                if (document.hasFocus() && document.visibilityState === "visible") {
                    get().markMessagesAsRead(selectedUser._id);
                }
            } else {
                // Increment unread count for this sender in the users list
                const updatedUsers = get().users.map((u) => {
                    if (u._id === senderIdStr) {
                        return { ...u, unreadCount: (u.unreadCount || 0) + 1 };
                    }
                    return u;
                });
                set({ users: updatedUsers });
            }
            get().updateUserPosition(senderIdStr, newMessage.createdAt);
        });

        socket.on("messagesRead", ({ readerId }) => {
            const {selectedUser}=get();
            if (!selectedUser || readerId !== selectedUser._id) return;
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) return;

            const updatedMessages = get().messages.map((msg) => {
                const msgSenderIdStr = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
                if (msgSenderIdStr === authUser._id) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });
            set({ messages: updatedMessages });
        });

        socket.on("newGroupMessage", (newGroupMessage) => {
            const { selectedGroup } = get();
            if (selectedGroup && newGroupMessage.groupId === selectedGroup._id) {
                set({ messages: [...get().messages, newGroupMessage] });
            }
        });

        socket.on("userTyping", ({ senderId }) => {
            set({
                typingUsers: { ...get().typingUsers, [senderId]: true },
            });
        });

        socket.on("userStoppedTyping", ({ senderId }) => {
            set({
                typingUsers: { ...get().typingUsers, [senderId]: false },
            });
        });
    },

    unsubscribeFromMessages:()=>{
        const socket=useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("newGroupMessage");
            socket.off("messagesRead");
            socket.off("userTyping");
            socket.off("userStoppedTyping");
        }
    },

    updateUserPosition: (userId, timestamp) => {
        const updatedUsers = get().users.map((u) => {
            if (u._id === userId) {
                return { ...u, lastMessageAt: new Date(timestamp) };
            }
            return u;
        });
        updatedUsers.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        set({ users: updatedUsers });
    },

    setSelectedUser: (selectedUser)=> {
        set({selectedUser, selectedGroup: null});
        if (selectedUser) {
            const updatedUsers = get().users.map((u) => {
                if (u._id === selectedUser._id) {
                    return { ...u, unreadCount: 0 };
                }
                return u;
            });
            set({ users: updatedUsers });
        }
    },

    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/group");
            set({ groups: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await axiosInstance.post("/group/create", groupData);
            set({ groups: [...get().groups, res.data] });
            toast.success("Group created successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    },

    setSelectedGroup: (selectedGroup) => {
        set({ selectedGroup, selectedUser: null });
    },
}));