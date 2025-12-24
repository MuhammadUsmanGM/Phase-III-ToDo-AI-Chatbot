'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tasksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  Lock,
  Bell,
  Globe,
  Camera,
  Upload,
  Edit,
  Save,
  X
} from 'lucide-react';

export default function UserProfile() {
  const { token, userId, userEmail, userName, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userName || '',
    email: userEmail || ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dueDateReminders: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSaveProfile = async () => {
    if (!token || !userId) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real app, this would call an API to update the user profile
      // For now, we'll just simulate the update
      console.log('Updating profile:', editData);
      
      // Here you would typically make an API call to update profile
      // const response = await api.updateProfile(userId, editData, token);
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!token || !userId) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real app, this would call an API to change the password
      // const response = await api.changePassword(userId, passwordData, token);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      console.error('Password update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real app, this would save notification and privacy settings
      console.log('Saving preferences:', { notificationSettings, privacySettings });
      
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
      console.error('Preferences error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`/api/placeholder/96/96`} alt={userName || 'User'} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400">
                {userName?.charAt(0).toUpperCase() || userId?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
            <User className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {userName || `User ${userId || 'Guest'}`}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">{userEmail || 'user@example.com'}</p>
        </CardHeader>
        
        <CardContent>
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              {message.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-800 dark:text-white">
                        <User className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={`/api/placeholder/64/64`} alt={userName || 'User'} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400">
                            {userName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Profile Picture</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">JPG, GIF or PNG. Max size of 10MB</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative mt-1">
                            {isEditing ? (
                              <>
                                <Input
                                  id="name"
                                  value={editData.name}
                                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                                  className="pl-10"
                                  disabled={loading}
                                />
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </>
                            ) : (
                              <div className="flex items-center pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-600/30 rounded-md border border-gray-200 dark:border-gray-600">
                                <User className="mr-3 h-4 w-4 text-gray-400" />
                                <span className="text-gray-800 dark:text-white">{userName || `User ${userId || 'Guest'}`}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative mt-1">
                            {isEditing ? (
                              <>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editData.email}
                                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                                  className="pl-10"
                                  disabled={loading}
                                />
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </>
                            ) : (
                              <div className="flex items-center pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-600/30 rounded-md border border-gray-200 dark:border-gray-600">
                                <Mail className="mr-3 h-4 w-4 text-gray-400" />
                                <span className="text-gray-800 dark:text-white">{userEmail || 'user@example.com'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="joined-date">Member Since</Label>
                          <div className="flex items-center pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-600/30 rounded-md border border-gray-200 dark:border-gray-600 mt-1">
                            <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                            <span className="text-gray-800 dark:text-white">Jan 1, 2025</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="account-type">Account Type</Label>
                          <div className="flex items-center pl-3 pr-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-md border border-indigo-200 dark:border-indigo-700/50 mt-1">
                            <Shield className="mr-3 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-indigo-800 dark:text-indigo-300 font-medium">Free Plan</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            setEditData({ name: userName || '', email: userEmail || '' });
                          }}
                          disabled={loading}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        disabled={loading}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-gray-800 dark:text-white">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Tasks Completed</span>
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                          42
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Productivity Score</span>
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300">
                          85%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Account Status</span>
                        <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300">
                          Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Last Login</span>
                        <span className="text-sm text-gray-800 dark:text-white">2 hours ago</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800 dark:text-white">
                    <Lock className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="current-password"
                            type="password"
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="pl-10"
                            disabled={loading}
                          />
                          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="pl-10"
                            disabled={loading}
                          />
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="pl-10"
                            disabled={loading}
                          />
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Password Tips</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                          <span>At least 8 characters</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                          <span>Include uppercase &amp; lowercase letters</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                          <span>Add numbers &amp; symbols</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800 dark:text-white">
                    <Shield className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Add extra security to your account</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Account Recovery</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Set up recovery options for your account</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Session Management</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">View and manage active sessions</p>
                      </div>
                      <Button variant="outline">View Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-white">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications via email</p>
                    </div>
                    <Button
                      variant={notificationSettings.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: !notificationSettings.emailNotifications
                      })}
                    >
                      {notificationSettings.emailNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications on your device</p>
                    </div>
                    <Button
                      variant={notificationSettings.pushNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: !notificationSettings.pushNotifications
                      })}
                    >
                      {notificationSettings.pushNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Due Date Reminders</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Get notified before task due dates</p>
                    </div>
                    <Button
                      variant={notificationSettings.dueDateReminders ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        dueDateReminders: !notificationSettings.dueDateReminders
                      })}
                    >
                      {notificationSettings.dueDateReminders ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={loading}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-white">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Profile Visibility</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Control who can see your profile</p>
                    </div>
                    <div className="flex space-x-2">
                      {(['public', 'friends', 'private'] as const).map((option) => (
                        <Button
                          key={option}
                          variant={privacySettings.profileVisibility === option ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: option
                          })}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Data Sharing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Allow data sharing for improvements</p>
                    </div>
                    <Button
                      variant={privacySettings.dataSharing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrivacySettings({
                        ...privacySettings,
                        dataSharing: !privacySettings.dataSharing
                      })}
                    >
                      {privacySettings.dataSharing ? "Allowed" : "Blocked"}
                    </Button>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={loading}
                    >
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/50">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-200">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-300">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Export Data</h4>
                        <p className="text-sm text-red-600 dark:text-red-300">Download a copy of your data</p>
                      </div>
                      <Button variant="outline" className="border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40">Export</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}