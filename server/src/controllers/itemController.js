import Joi from 'joi';
import { Item } from '../models/Item.js';

const createSchema = Joi.object({
  title: Joi.string().min(2).max(60).required(),
  description: Joi.string().max(500),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other').default('other'),
  status: Joi.string().valid('lost', 'found', 'claimed').default('lost'),
  location: Joi.string().max(200),
  reportedBy: Joi.string().hex().length(24)
});

const updateSchema = Joi.object({
  title: Joi.string().min(2).max(60),
  description: Joi.string().max(500),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().max(200),
});
const filterSchema = Joi.object({
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().max(200),
});

function publicItem(i) {
  return {
    id: i._id.toString(),
    title: i.title,
    description: i.description,
    category: i.category,
    status: i.status,
    location: i.location,
    reportedBy: i.reportedBy,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt
  };
}

// GET /api/items?status=&category=&location=
export async function getAllItems(req, res, next) {
  try {
    const { value: filter, error } = filterSchema.validate(req.query);
    if (error) return res.status(400).json({ message: error.message });

    const items = await Item.find(filter).sort({ createdAt: -1 }).populate('reportedBy', 'name email').lean();
    res.json({ items: items.map(publicItem) });
  } catch (err) { next(err); }
}

// GET /api/items/:id
export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email').lean();
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item: publicItem(item) });
  } catch (err) { next(err); }
}

// POST /api/items
export async function createItem(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await Item.findOne({ title: value.title, location: value.location });
    if (existing) return res.status(409).json({ message: 'Item with the same title and location already exists' });

    const item = await Item.create(value);
    res.status(201).json({ item: publicItem(item) });

  } catch (err) {
    next(err);
  }
}

// PATCH /api/items/:id
export async function updateItem(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const item = await Item.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item: publicItem(item) });
  } catch (err) { next(err); }
}

// DELETE /api/items/:id
export async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
