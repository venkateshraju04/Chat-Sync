import React, { useRef, useState, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';

const MessageInput = () => {
  const [text,setText]=useState('');
  const [imagePreview,setImagePreview]=useState(null);
  const fileInputRef=useRef(null);
  const {sendMessage, selectedUser}=useChatStore();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    setIsTyping(false);
    setShowEmojiPicker(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    return () => {
      const socket = useAuthStore.getState().socket;
      if (socket && selectedUser) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }
    };
  }, [selectedUser]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  const handleImageChange=(e)=>{
    const file=e.target.files[0];
    if(!file.type.startsWith('image')){
      toast.error('Please select an image file');
      return;
    }
    const reader=new FileReader();
    reader.onloadend=()=>{
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage=()=>{
    setImagePreview(null);
    if(fileInputRef.current)fileInputRef.current.value="";
  };

  const handleTextChange=(e)=>{
    const value=e.target.value;
    setText(value);

    const socket = useAuthStore.getState().socket;
    if (!socket || !selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage=async (e)=>{
    e.preventDefault();
    if(!text.trim() && !imagePreview)return;
    try{
      const socket = useAuthStore.getState().socket;
      if (socket && selectedUser && isTyping) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
        setIsTyping(false);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setShowEmojiPicker(false);

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText('');
      setImagePreview(null);
      if(fileInputRef.current)fileInputRef.current.value="";
    }catch(error){ 
      console.log("Failed to send message", error);
    }

  };
  return (
    <div className="p-4 w-full relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            theme={theme === "dark" || theme === "black" || theme === "luxury" || theme === "dracula" ? "dark" : "light"}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className='flex-1 flex gap-2'>
          <input type='text' className='w-full input input-bordered rounded-lg input-sm sm:input-md' placeholder='Type a message...' value={text} onChange={handleTextChange} />

          <input type='file' accept='image/*' className='hidden' ref={fileInputRef} onChange={handleImageChange} />

          {/* Emoji Button */}
          <button
            type='button'
            className={`btn btn-circle ${showEmojiPicker ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>

          {/* Image Button */}
          <button
            type='button'
            className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={()=>fileInputRef.current.click()}
            >
          <Image size={20} />
          </button>

        </div>
        <button type='submit' className='btn btn-sm btn-circle' disabled={!text.trim() && !imagePreview}>
          <Send size={22} />
        </button>
      </form>
      </div>
  )
}

export default MessageInput