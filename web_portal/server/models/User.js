import mongoose from 'mongoose'

const { Schema, model } = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    },
    device: {
      type: String,
      required: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date
}, {
  timestamps: true
})

// Method to add token to user's tokens array
userSchema.methods.addToken = async function(token, device) {
  this.tokens.push({ token, device })
  await this.save()
  return token
}

// Method to remove specific token
userSchema.methods.removeToken = async function(token) {
  this.tokens = this.tokens.filter(t => t.token !== token)
  await this.save()
}

// Method to remove all tokens (logout from all devices)
userSchema.methods.removeAllTokens = async function() {
  this.tokens = []
  await this.save()
}

// Method to check if token exists and is valid
userSchema.methods.hasValidToken = function(token) {
  return this.tokens.some(t => t.token === token)
}

// Update lastLogin timestamp
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date()
  await this.save()
}

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}

export default model('User', userSchema) 