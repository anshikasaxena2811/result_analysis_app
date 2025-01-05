import express from 'express'
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  getLoginDevices,
  removeDevice,
  removeAllDevices
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/auth.js'

const userRouter = express.Router()

// Public routes
userRouter.post('/api/users/register', register)
userRouter.post('/api/users/login', login)
userRouter.post('/api/users/logout', logout)

// Protected routes
userRouter.get('/api/users/profile', protect, getProfile)
userRouter.put('/api/users/profile', protect, updateProfile)
userRouter.put('/api/users/change-password', protect, changePassword)

// Device management routes
userRouter.get('/api/users/devices', protect, getLoginDevices)
userRouter.delete('/api/users/devices/:deviceId', protect, removeDevice)
userRouter.delete('/api/users/devices', protect, removeAllDevices)

// Admin only routes
userRouter.get('/api/users', protect, authorize('admin'), getAllUsers)
userRouter.delete('/api/users/:id', protect, authorize('admin'), deleteUser)

export default userRouter 