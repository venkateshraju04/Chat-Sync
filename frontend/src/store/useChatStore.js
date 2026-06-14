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
    getMessages: async (userId) => {
        set({isMessagesLoading:true});
        try {
            const res=await axiosInstance.get(`/message/${userId}`);
            set({messages: res.data});
            get().markMessagesAsRead(userId);
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
                if (msg.senderId === userId) {
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
        const {selectedUser,messages}=get();
        try {
            const res=await axiosInstance.post(`/message/send/${selectedUser._id}`,messageData);
            set({messages: [...messages,res.data]});
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: ()=>{
        const {selectedUser}=get();
        if(!selectedUser) return;

        const socket=useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage",(newMessage)=>{
            if(newMessage.senderId!==selectedUser._id) return;
            set({messages: [...get().messages,newMessage]});
            get().markMessagesAsRead(selectedUser._id);
        });

        socket.on("messagesRead", ({ readerId }) => {
            if (readerId !== selectedUser._id) return;
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) return;

            const updatedMessages = get().messages.map((msg) => {
                if (msg.senderId === authUser._id) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });
            set({ messages: updatedMessages });
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
            socket.off("messagesRead");
            socket.off("userTyping");
            socket.off("userStoppedTyping");
        }
    },

    setSelectedUser: (selectedUser)=> set({selectedUser}),
}));