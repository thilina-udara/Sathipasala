const mongoose = require('mongoose');

const HomeSwiperImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeSwiperImage', HomeSwiperImageSchema);
