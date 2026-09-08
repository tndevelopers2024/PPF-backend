import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'SHOP_OWNER', 'INSTALLER', 'VIEWER'],
      default: 'VIEWER',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    phone: {
      type: String,
      default: '',
    },
    shopName: {
      type: String,
      default: '',
    },
    preferences: {
      defaultFilmWidth: { type: Number, default: 1524 },
      unit: { type: String, enum: ['in', 'mm'], default: 'in' },
      defaultPlotterId: { type: String, default: '' },
      cutSpeed: { type: Number, default: 300 },
      bladeForce: { type: Number, default: 120 },
      autoNestingMode: { type: String, default: 'standard' },
      edgeWrapMargin: { type: Number, default: 6 },
      soundAlerts: { type: Boolean, default: true },
      confirmBeforeCut: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
