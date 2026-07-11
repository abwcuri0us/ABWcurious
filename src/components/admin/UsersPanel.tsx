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
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  provider: string;
  country: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface UsersPanelProps {
  token: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  editor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  author: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  user: 'bg-secondary text-muted-foreground border-border',
};

export default function UsersPanel({ token }: UsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

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
        setUsers(data.data || []);
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

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User role updated.');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update role.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteConfirm.id}`, {
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
    } finally {
      setDeleting(false);
      setDeleteConfirm({ open: false, id: '', name: '' });
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Users & Roles
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and their permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-[200px] h-9 text-sm bg-secondary/50 border-border pl-9"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <UsersIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      {user.name || 'Unnamed'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={roleColors[user.role] || roleColors.user}>
                        {user.role}
                      </Badge>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateRole(user.id, value)}
                      >
                        <SelectTrigger className="w-[30px] h-6 p-0 border-0">
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
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewUser(user)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm({ open: true, id: user.id, name: user.name || user.email })}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create New User
            </DialogTitle>
            <DialogDescription className="sr-only">
              Create a new user account with name, email, password, and role.
            </DialogDescription>
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

      {/* View User Details Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => { if (!open) setViewUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              User Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                  {(viewUser.name || viewUser.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{viewUser.name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge variant="outline" className={roleColors[viewUser.role] || roleColors.user}>
                    {viewUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-medium capitalize">{viewUser.provider || 'credentials'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="font-medium">{viewUser.country || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="font-medium">{viewUser.city || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewUser.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(viewUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {viewUser.bio && (
                <div>
                  <p className="text-muted-foreground text-sm">Bio</p>
                  <p className="text-sm mt-1">{viewUser.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="sr-only">
              Confirm deletion of a user account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete user &ldquo;{deleteConfirm.name}&rdquo;? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: '', name: '' })}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
