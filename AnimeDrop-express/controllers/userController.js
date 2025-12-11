import UserModel from "../models/userModel.js";
import AnimeModel from "../models/animeModel.js";
import NotificationModel from "../models/notificationModel.js";

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.username = { $regex: search, $options: "i" };
    }

    const users = await UserModel.find(query).select("-password").limit(20);

    res.json({
      message: "Users berhasil diambil",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select("-password").populate("followers", "username avatar").populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    const animeList = await AnimeModel.find({ user: user._id }).limit(10);

    res.json({
      message: "User profile berhasil diambil",
      data: {
        user,
        animeList,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Follow User
export const followUser = async (req, res) => {
  try {
    const userToFollow = await UserModel.findById(req.params.userId);
    const currentUser = await UserModel.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself", data: null });
    }

    // Cek apakah sudah follow
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "Already following this user", data: null });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Buat notifikasi
    await NotificationModel.create({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: "follow",
      message: `${currentUser.username} started following you`,
      link: `/users/${currentUser._id}`,
    });

    res.json({
      message: "Successfully followed user",
      data: null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await UserModel.findById(req.params.userId);
    const currentUser = await UserModel.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      message: "Successfully unfollowed user",
      data: null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await UserModel.findById(req.user._id);

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};
