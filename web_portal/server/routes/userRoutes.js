import express from 'express'
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/auth.js'

const userRouter = express.Router()

// Public routes
userRouter.post('/api/users/register', register)
userRouter.post('/api/users/login', login)
userRouter.post('/api/users/logout', logout)

// Protected routes
userRouter.get('/profile', protect, getProfile)
userRouter.put('/profile', protect, updateProfile)

// Admin only routes
userRouter.get('/', protect, authorize('admin'), getAllUsers)
userRouter.delete('/:id', protect, authorize('admin'), deleteUser)

export default userRouter 