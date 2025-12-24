'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Share,
  UserPlus,
  Users,
  Lock,
  Eye,
  Check,
  X,
  Copy,
  Send,
  Trash2
} from 'lucide-react';

interface TaskSharingProps {
  task: Task;
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'editor';
  avatar?: string;
}

export default function TaskSharing({ task }: TaskSharingProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 2,
      name: 'Robert Johnson',
      email: 'robert@example.com',
      role: 'viewer',
      avatar: '/api/placeholder/32/32'
    }
  ]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const addCollaborator = () => {
    if (!newCollaboratorEmail || !validateEmail(newCollaboratorEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // In a real app, this would call an API to invite the collaborator
    const newCollaborator: Collaborator = {
      id: collaborators.length + 1,
      name: newCollaboratorEmail.split('@')[0],
      email: newCollaboratorEmail,
      role: newCollaboratorRole
    };

    setCollaborators([...collaborators, newCollaborator]);
    setNewCollaboratorEmail('');
    setInviteMessage('');
    setShowInviteForm(false);
  };

  const removeCollaborator = (id: number) => {
    setCollaborators(collaborators.filter(collaborator => collaborator.id !== id));
  };

  const updateRole = (id: number, newRole: 'viewer' | 'editor') => {
    setCollaborators(collaborators.map(collab => 
      collab.id === id ? { ...collab, role: newRole } : collab
    ));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 dark:text-white">
          <Share className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Share Task
          <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300">
            {collaborators.length} collaborators
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <Label htmlFor="share-link" className="text-gray-700 dark:text-gray-300">
              Share via Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-link"
                type="text"
                readOnly
                value={`${window.location.origin}/tasks/${task.id}`}
                className="bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyShareLink}
                className="border border-gray-300 dark:border-gray-600"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Anyone with this link can view this task {task.completed ? 'and its completion status' : ''}
            </p>
          </div>
          
          {/* Invite Collaborators Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-700 dark:text-gray-300">
                Invite Collaborators
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {showInviteForm ? 'Cancel' : 'Invite People'}
              </Button>
            </div>
            
            {showInviteForm && (
              <Card className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-700/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="email"
                          type="email"
                          placeholder="person@example.com"
                          value={newCollaboratorEmail}
                          onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                          className="pl-10"
                        />
                        <Send className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                        Role
                      </Label>
                      <select
                        id="role"
                        value={newCollaboratorRole}
                        onChange={(e) => setNewCollaboratorRole(e.target.value as 'viewer' | 'editor')}
                        className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                      Message (optional)
                    </Label>
                    <textarea
                      id="message"
                      placeholder="Add a personal note..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={addCollaborator} className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          {/* Collaborators List */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">
              Collaborators ({collaborators.length})
            </Label>
            
            {collaborators.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">No collaborators yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Invite people to collaborate on this task</p>
              </div>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div 
                    key={collaborator.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {collaborator.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{collaborator.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{collaborator.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={collaborator.role}
                        onChange={(e) => updateRole(collaborator.id, e.target.value as 'viewer' | 'editor')}
                        className="p-2 bg-gray-50 dark:bg-gray-600/50 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-500 rounded-md"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(collaborator.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Permissions Explanation */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Permission Levels</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">Viewer</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Can view the task and comments</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">Editor</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Can view, edit, and update the task</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}