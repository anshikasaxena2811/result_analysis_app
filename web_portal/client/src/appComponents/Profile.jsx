import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { setUser, clearUser } from '../store/userSlice'

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  console.log("user => ", user)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionYear: '',
    program: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [devices, setDevices] = useState([])
  const [deviceLoading, setDeviceLoading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      console.log("fetching profile")
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          withCredentials: true
      })
      console.log("response => ", response)

      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to fetch profile')
      }

      dispatch(setUser(response.data.data))
    } catch (error) {
      toast.error(error.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  fetchProfile()

  }, [])
  

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        admissionYear: user.admissionYear || '',
        program: user.program || ''
      }))
    }
  }, [user])

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`,{
        name: formData.name,
        email: formData.email,
        program: formData.program
      }, {
        withCredentials: true
      })
      console.log("response => ", response)

      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      })
      console.log("response => ", response)
      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to update password')
      }

      toast.success('Password updated successfully')

      // Clear password fields

      toast.success('Password updated successfully')
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/logout`, {}, {
        withCredentials: true
      })
      dispatch(clearUser())
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const fetchDevices = async () => {
    setDeviceLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/devices`, {
        withCredentials: true
      })
      setDevices(response.data.devices)
    } catch (error) {
      toast.error('Failed to fetch devices')
    } finally {
      setDeviceLoading(false)
    }
  }

  const handleRemoveDevice = async (deviceId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/devices/${deviceId}`, {
        withCredentials: true
      })
      toast.success('Device removed successfully')
      fetchDevices() // Refresh the devices list
    } catch (error) {
      toast.error('Failed to remove device')
    }
  }

  const handleRemoveAllDevices = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/devices`, {
        withCredentials: true
      })
      toast.success('Logged out from all devices')
      dispatch(clearUser())
      fetchDevices() // Refresh the devices list
    } catch (error) {
      toast.error('Failed to remove all devices')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionYear">Admission Year</Label>
                <Input
                  id="admissionYear"
                  name="admissionYear"
                  placeholder="Enter your admission year"
                  value={formData.admissionYear}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  name="program"
                  placeholder="Enter your program"
                  value={formData.program}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button 
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Devices</CardTitle>
            <CardDescription>
              Manage your active login sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deviceLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : devices.length > 0 ? (
              <>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{device.device}</p>
                        <p className="text-sm text-muted-foreground">
                          Last used: {new Date(device.lastUsed).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleRemoveAllDevices}
                >
                  Logout All Devices
                </Button>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                No active login sessions found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 