import mongoose from 'mongoose'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Seed admin user after connection
    await seedAdmin()

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected')
    })

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('MongoDB connection closed through app termination')
        process.exit(0)
      } catch (err) {
        console.error('Error closing MongoDB connection:', err)
        process.exit(1)
      }
    })

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB disconnected')
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`)
    throw error
  }
}

export const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@admin.admin' })
    
    if (!adminExists) {
      // Hash the password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash('iamadmin123', salt)

      // Create admin user
      await User.create({
        name: 'Admin',
        email: 'admin@admin.admin',
        password: hashedPassword,
        role: 'admin'
      })

      console.log('Admin user seeded successfully')
    }
  } catch (error) {
    console.error('Error seeding admin user:', error)
    throw error
  }
} 