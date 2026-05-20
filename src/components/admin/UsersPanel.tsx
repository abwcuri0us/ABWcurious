'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  UserPlus,
  Shield,
  Loader2,
  Users as UsersIcon,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  provider: string;
  country?: string | null;
  created_at: string;
}

interface UsersPanelProps {
  token: string;
  userId: string;
  onOpenMessages?: (userId: string, userName: string) => void;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  editor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  author: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  user: 'bg-secondary text-muted-foreground border-border',
};

export default function UsersPanel({ token, userId, onOpenMessages }: UsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageUserId, setMessageUserId] = useState('');
  const [messageUserName, setMessageUserName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ userId: string; newRole: string; userName: string } | null>(null);

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User created successfully.');
        setCreateOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('user');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: targetUserId, role }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User role updated.');
        setConfirmRoleChange(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update role.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const handleDeleteUser = async (targetUserId: string, userName: string) => {
    if (targetUserId === userId) {
      toast.error('You cannot delete your own account.');
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User deleted.');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }

    setSendingMessage(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: messageUserId,
          content: messageText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent.');
        setMessageOpen(false);
        setMessageText('');
      } else {
        toast.error(data.error || 'Failed to send message.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSendingMessage(false);
    }
  };

  const openMessageDialog = (targetUserId: string, targetUserName: string) => {
    if (onOpenMessages) {
      onOpenMessages(targetUserId, targetUserName);
    } else {
      setMessageUserId(targetUserId);
      setMessageUserName(targetUserName);
      setMessageOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Users & Roles
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and their permissions
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-secondary/50 border-border h-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-secondary/50 border-border h-10">
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <UsersIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Country</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Created</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <React.Fragment key={u.id}>
                  <TableRow className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate">{u.name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground truncate sm:hidden">{u.email}</div>
                        </div>
                        {expandedUser === u.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(value) => {
                          if (value !== u.role) {
                            setConfirmRoleChange({ userId: u.id, newRole: value, userName: u.name || u.email });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-1.5">
                              <Shield className="h-3 w-3 text-red-500" /> Admin
                            </span>
                          </SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="author">Author</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {u.country || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openMessageDialog(u.id, u.name || u.email)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          aria-label={`Message ${u.name || u.email}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Delete user: ${u.name || u.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Expanded Details */}
                  {expandedUser === u.id && (
                    <TableRow className="bg-secondary/10">
                      <TableCell colSpan={6} className="px-6 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email:</span>{' '}
                            <span className="text-foreground">{u.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Country:</span>{' '}
                            <span className="text-foreground">{u.country || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Provider:</span>{' '}
                            <span className="text-foreground capitalize">{u.provider}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirm Role Change Dialog */}
      <Dialog open={!!confirmRoleChange} onOpenChange={() => setConfirmRoleChange(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Confirm Role Change
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to change <strong className="text-foreground">{confirmRoleChange?.userName}</strong>&apos;s role to{' '}
            <strong className="text-foreground">{confirmRoleChange?.newRole}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRoleChange(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmRoleChange) {
                  handleUpdateRole(confirmRoleChange.userId, confirmRoleChange.newRole);
                }
              }}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="user-name" className="text-sm font-medium mb-1.5 block">
                Full Name
              </Label>
              <Input
                id="user-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="John Doe"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label htmlFor="user-email" className="text-sm font-medium mb-1.5 block">
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@example.com"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label htmlFor="user-password" className="text-sm font-medium mb-1.5 block">
                Password
              </Label>
              <Input
                id="user-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={creating}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {creating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> Create User</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Message {messageUserName}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {sendingMessage ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
