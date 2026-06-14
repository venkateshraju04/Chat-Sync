import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Camera, Search, Loader, Users } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { users, createGroup, setSelectedGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPic, setGroupPic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setGroupPic(reader.result);
    };
  };

  const handleToggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedMembers.length < 1) {
      toast.error("Please select at least one other member");
      return;
    }

    setIsSubmitting(true);
    try {
      const newGroup = await createGroup({
        name: groupName.trim(),
        members: selectedMembers,
        groupPic: groupPic || "",
      });
      if (newGroup) {
        setSelectedGroup(newGroup);
        // Reset form
        setGroupName("");
        setSelectedMembers([]);
        setGroupPic(null);
        setSearchQuery("");
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 border border-base-300 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="size-5" />
            </div>
            <h2 className="text-xl font-bold">Create Group</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-base-200 rounded-lg text-base-content/60 hover:text-base-content transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="size-24 rounded-full overflow-hidden border-2 border-base-300 bg-base-200 flex items-center justify-center">
                {groupPic ? (
                  <img src={groupPic} alt="Group Preview" className="size-full object-cover" />
                ) : (
                  <Users className="size-10 text-base-content/40" />
                )}
              </div>
              <label
                htmlFor="group-avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary-focus hover:scale-105 text-primary-content rounded-full cursor-pointer transition-all shadow-md"
              >
                <Camera className="size-4" />
                <input
                  type="file"
                  id="group-avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            <span className="text-xs text-base-content/50">Group Picture (Optional)</span>
          </div>

          {/* Group Name Input */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">Group Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Project Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Members Checklist */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Select Members</span>
              <span className="text-xs text-base-content/50">
                {selectedMembers.length} selected
              </span>
            </div>

            {/* Member Search */}
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full pl-8 rounded-lg text-xs bg-base-200/50 focus:outline-none focus:border-primary transition-all"
                disabled={isSubmitting}
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-base-content/40 hover:text-base-content"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="border border-base-300 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-base-300 mt-2 bg-base-200/30">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isChecked = selectedMembers.includes(user._id);
                  return (
                    <label
                      key={user._id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-base-200/50 transition-colors ${
                        isChecked ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="size-8 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold">{user.fullName}</p>
                          <p className="text-[10px] text-base-content/50 truncate max-w-[180px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleMember(user._id)}
                        className="checkbox checkbox-sm checkbox-primary rounded-md"
                        disabled={isSubmitting}
                      />
                    </label>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-base-content/50">
                  No contacts found
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-ghost btn-sm rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim() || selectedMembers.length < 1}
              className="btn btn-primary btn-sm rounded-xl px-4 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
