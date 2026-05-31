import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
    loading: false,
    searchByUsername: async (username) => {
        try {
            set({ loading: true });

            const user = await friendService.searchByUsername(username);

            return user;
        } catch (error) {
            console.error("Lỗi xảy ra khi tìm user bằng username", error);
            return null;
        } finally {
            set({ loading: false });
        }
    },
    addFriend: async (to, message) => {
        try {
            set({ loading: true });
            const resultMessage = await friendService.sendFriendRequest(to, message);
            return resultMessage;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Lỗi xảy ra khi gửi kết bạn. Hãy thử lại";
            console.error("Lỗi xảy ra khi addFriend:", errorMessage);
            throw new Error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },
}));