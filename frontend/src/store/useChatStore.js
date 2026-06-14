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
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isMessagesLoading:false});
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
            socket.off("userTyping");
            socket.off("userStoppedTyping");
        }
    },

    setSelectedUser: (selectedUser)=> set({selectedUser}),
}));