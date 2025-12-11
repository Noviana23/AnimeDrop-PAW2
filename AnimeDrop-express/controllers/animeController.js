import AnimeModel from "../models/animeModel.js";
import NotificationModel from "../models/notificationModel.js";

// Get Discovery (All Anime - Public)
export const getDiscovery = async (req, res) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    if (genre) {
      query.genres = genre;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const animes = await AnimeModel.find(query).populate("user", "username avatar").sort({ createdAt: -1 }).limit(50);

    res.json({
      message: "Discovery anime berhasil diambil",
      data: animes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Get My List (User's Anime)
export const getMyList = async (req, res) => {
  try {
    const animes = await AnimeModel.find({ user: req.user._id }).sort({ updatedAt: -1 });

    res.json({
      message: "Anime list berhasil diambil",
      data: animes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Get Anime by ID
export const getAnimeById = async (req, res) => {
  try {
    const anime = await AnimeModel.findById(req.params.id).populate("user", "username avatar").populate("reviews.user", "username avatar");

    if (!anime) {
      return res.status(404).json({ message: "Anime not found", data: null });
    }

    res.json({
      message: "Anime detail berhasil diambil",
      data: anime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Create Anime
export const createAnime = async (req, res) => {
  try {
    const { title, description, image, genres, status, episodes } = req.body;

    const anime = await AnimeModel.create({
      title,
      description,
      image,
      genres: genres || [],
      status,
      episodes: episodes || 0,
      user: req.user._id,
    });

    await anime.populate("user", "username avatar");

    res.status(201).json({
      message: "Anime berhasil ditambahkan",
      data: anime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Update Anime
export const updateAnime = async (req, res) => {
  try {
    const anime = await AnimeModel.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({ message: "Anime not found", data: null });
    }

    if (anime.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized", data: null });
    }

    const { title, description, image, genres, status, episodes, episodesWatched } = req.body;

    anime.title = title || anime.title;
    anime.description = description || anime.description;
    anime.image = image || anime.image;
    anime.genres = genres || anime.genres;
    anime.status = status || anime.status;
    anime.episodes = episodes !== undefined ? episodes : anime.episodes;
    anime.episodesWatched = episodesWatched !== undefined ? episodesWatched : anime.episodesWatched;
    anime.updatedAt = Date.now();

    await anime.save();
    await anime.populate("user", "username avatar");

    res.json({
      message: "Anime berhasil diupdate",
      data: anime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Delete Anime
export const deleteAnime = async (req, res) => {
  try {
    const anime = await AnimeModel.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({ message: "Anime not found", data: null });
    }

    if (anime.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized", data: null });
    }

    await anime.deleteOne();

    res.json({
      message: "Anime berhasil dihapus",
      data: anime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Add Review
export const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const anime = await AnimeModel.findById(req.params.id);

    if (!anime) {
      return res.status(404).json({ message: "Anime not found", data: null });
    }

    // Cek apakah user sudah review
    const existingReview = anime.reviews.find((r) => r.user.toString() === req.user._id.toString());

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this anime", data: null });
    }

    anime.reviews.push({
      user: req.user._id,
      rating,
      review,
    });

    // Update average rating
    const sum = anime.reviews.reduce((acc, r) => acc + r.rating, 0);
    anime.averageRating = (sum / anime.reviews.length).toFixed(1);

    await anime.save();

    // Buat notifikasi untuk pemilik anime
    if (anime.user.toString() !== req.user._id.toString()) {
      await NotificationModel.create({
        recipient: anime.user,
        sender: req.user._id,
        type: "review",
        message: `${req.user.username} reviewed your anime: ${anime.title}`,
        link: `/anime/${anime._id}`,
      });
    }

    await anime.populate("reviews.user", "username avatar");

    res.json({
      message: "Review berhasil ditambahkan",
      data: anime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};
