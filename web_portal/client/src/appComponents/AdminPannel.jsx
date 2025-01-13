import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function AdminPanel() {
  const { user } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/users'); // Replace with your API endpoint
        console.log("response from admin panel => ", response);
        
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    if (role === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === role));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>
              You are not authorized to view this page, kindly go to some other page
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Manage and view user details registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Total Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Statistics</h3>
            <div className="flex justify-between">
              <p>Total Users: <span className="font-bold">{users.length}</span></p>
              <p>Filtered Users: <span className="font-bold">{filteredUsers.length}</span></p>
            </div>
          </div>

          {/* Role Filter */}
          <div className="mt-6">
            <Label>Filter by Role</Label>
            <Select onValueChange={handleRoleFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="faculty">Faculties</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">User List</h3>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full bg-background border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-t">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Admin Panel - Manage user roles and statistics</p>
        </CardFooter>
      </Card>
    </div>
  );
}
