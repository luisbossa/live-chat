const User = require("../models/User");
const Story = require("../models/Story");
const upload = require("../middleware/upload");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const audience = (userId) => [userId, ...User.contactIds(userId)];

exports.feed = (req, res) => {
  res.json({ stories: Story.feedFor(req.user.id) });
};

exports.create = (req, res, next) => {
  try {
    if (!req.file) throw httpError(422, "Elige una foto para tu estado.");
    const story = Story.create({
      userId: req.user.id,
      mediaUrl: upload.urlFor(req.file),
      caption: validate.str(req.body.caption, 200) || null,
    });
    realtime.toUsers(audience(req.user.id), "story:new", { userId: req.user.id, storyId: story.id });
    res.status(201).json({ story });
  } catch (err) {
    next(err);
  }
};

exports.view = (req, res, next) => {
  const story = Story.findById(validate.toId(req.params.id));
  if (!story) return next(httpError(404, "El estado ya no está disponible."));
  if (story.user_id !== req.user.id) {
    Story.view(story.id, req.user.id);
    realtime.toUsers([story.user_id], "story:viewed", { storyId: story.id, viewer: User.toPublic(req.user) });
  }
  res.json({ ok: true });
};

exports.viewers = (req, res, next) => {
  const story = Story.findById(validate.toId(req.params.id));
  if (!story || story.user_id !== req.user.id) return next(httpError(404, "Estado no encontrado."));
  res.json({ viewers: Story.viewers(story.id) });
};

exports.remove = (req, res, next) => {
  const id = validate.toId(req.params.id);
  if (!id || !Story.remove(id, req.user.id)) return next(httpError(404, "Estado no encontrado."));
  realtime.toUsers(audience(req.user.id), "story:deleted", { userId: req.user.id, storyId: id });
  res.json({ ok: true });
};
