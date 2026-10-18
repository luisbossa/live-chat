const User = require("../models/User");
const Story = require("../models/Story");
const upload = require("../middleware/upload");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const audience = async (userId) => [userId, ...(await User.contactIds(userId))];

exports.feed = async (req, res) => {
  res.json({ stories: await Story.feedFor(req.user.id) });
};

exports.create = async (req, res) => {
  if (!req.file) throw httpError(422, "Elige una foto para tu estado.");
  const story = await Story.create({
    userId: req.user.id,
    mediaUrl: await upload.save(req.file),
    caption: validate.str(req.body.caption, 200) || null,
  });
  realtime.toUsers(await audience(req.user.id), "story:new", { userId: req.user.id, storyId: story.id });
  res.status(201).json({ story });
};

exports.view = async (req, res) => {
  const story = await Story.findById(validate.toId(req.params.id));
  if (!story) throw httpError(404, "El estado ya no está disponible.");
  if (story.user_id !== req.user.id) {
    await Story.view(story.id, req.user.id);
    realtime.toUsers([story.user_id], "story:viewed", { storyId: story.id, viewer: User.toPublic(req.user) });
  }
  res.json({ ok: true });
};

exports.viewers = async (req, res) => {
  const story = await Story.findById(validate.toId(req.params.id));
  if (!story || story.user_id !== req.user.id) throw httpError(404, "Estado no encontrado.");
  res.json({ viewers: await Story.viewers(story.id) });
};

exports.remove = async (req, res) => {
  const id = validate.toId(req.params.id);
  if (!id || !(await Story.remove(id, req.user.id))) throw httpError(404, "Estado no encontrado.");
  realtime.toUsers(await audience(req.user.id), "story:deleted", { userId: req.user.id, storyId: id });
  res.json({ ok: true });
};
