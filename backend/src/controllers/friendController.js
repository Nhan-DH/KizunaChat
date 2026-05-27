import Friend from '../models/Friend.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import mongoose from 'mongoose';

export const sendFriendRequest = async (req, res) => {
    try {
        const { to, request } = req.body;
        const from = req.user._id;

        // Check if users exist
        const userTo = await User.findById(to);
        const userFrom = await User.findById(from);

        if (!userTo || !userFrom) {
            return res.status(404).json({ message: "User not found" });
        }

        // check xem da la ban be hay loi moi da ton tai chua 
        let userA = from.toString();
        let userB = to.toString();
        if (userA > userB) {
            [userA, userB] = [userB, userA];
        }
        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }),
            FriendRequest.findOne({ from, to })
        ]);

        if (alreadyFriends) {
            return res.status(400).json({ message: "Hiện tại đã là bạn bè với người này" });
        }
        if (existingRequest) {
            return res.status(400).json({ message: "Đã gửi lời mời kết bạn đến người này" });
        }

        const newRequest = await FriendRequest.create({ from, to, message: request });
        return res.status(201).json({ message: "Đã gửi lời mời kết bạn thành công", request: newRequest });
    }
    catch (error) {
        console.error("co loi khi gui loi moi ket ban", error);
        res.status(500).json({ message: error.message });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại" });
        }
        if (friendRequest.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chấp nhận lời mời kết bạn này" });
        }

        // Sắp xếp userA và userB để đảm bảo tính nhất quán
        let userA = friendRequest.from.toString();
        let userB = friendRequest.to.toString();
        if (userA > userB) {
            [userA, userB] = [userB, userA];
        }

        // Tạo friend document với xử lý lỗi
        let friend;
        try {
            friend = await Friend.create({
                userA: new mongoose.Types.ObjectId(userA),
                userB: new mongoose.Types.ObjectId(userB)
            });
        } catch (createError) {
            console.error("Lỗi khi tạo Friend document:", createError);
            return res.status(500).json({ message: "Lỗi khi tạo dữ liệu bạn bè: " + createError.message });
        }

        await FriendRequest.findByIdAndDelete(requestId);

        const from = await User.findById(friendRequest.from).select("_id displayName avatarUrl").lean();

        return res.status(200).json({
            message: "Đã chấp nhận lời mời kết bạn", newfriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl
            }
        });
    }
    catch (error) {
        console.error("co loi khi chap nhan loi moi ket ban", error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại" });
        }

        if (friendRequest.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền từ chối lời mời kết bạn này" });
        }
        await FriendRequest.findByIdAndDelete(requestId);
        return res.status(200).json({ message: "Đã từ chối lời mời kết bạn" });
    }
    catch (error) {
        console.error("co loi khi tu choi loi moi ket ban", error);
        res.status(500).json({ message: error.message });
    }
};
export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        const friends = await Friend.find({
            $or: [{ userA: userId }, { userB: userId }]
        })
    }
    catch (error) {
        console.error("co loi khi lay danh sach ban be", error);
        res.status(500).json({ message: error.message });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
    }
    catch (error) {
        console.error("co loi khi lay loi moi ket ban", error);
        res.status(500).json({ message: error.message });
    }
};