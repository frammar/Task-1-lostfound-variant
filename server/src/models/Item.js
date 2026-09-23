import mongoose from 'mongoose';

// TODO: define the Item schema per README.md section 1.

const itemSchema = new mongoose.Schema(
  {
    title: {type : String, required: true},
    description: {type : String, required: false},
    category: {type : String, enum: [`electronics`, `clothing`, `documents`, `accessories`, `other`], default: `other`},
    status: {type: String, enum: [`lost`, `found`, 'claimed'], default: `lost`},
    location: {type : String, required: false},
    reportedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}

    // TODO: add more fields as needed
  },
  { timestamps: true },
);
itemSchema.index({ title: 1, location: 1 }, { unique: true }); 

export const Item = mongoose.model('Item', itemSchema);
