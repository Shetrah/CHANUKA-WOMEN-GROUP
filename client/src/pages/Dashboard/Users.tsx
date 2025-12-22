import { useState } from "react";
import { useUsers, useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Mail, Users2, ShieldCheck, MoreHorizontal, UserX, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApprovedUserSchema, type InsertApprovedUser } from "@shared/schema";
import { z } from "zod";

// Extending schema for form validation
const formSchema = insertApprovedUserSchema.extend({
  email: z.string().email("Invalid email address"),
});

type UserFormValues = z.infer<typeof formSchema>;

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage approved admins and staff access.</p>
        </div>
        <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="dashboard-card p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Approved On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-muted-foreground font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: any }) {
  const toggleStatus = useUpdateUser();
  
  const handleToggleStatus = () => {
    toggleStatus.mutate({
      id: user.id,
      isActive: !user.isActive
    });
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user.email.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{user.email}</div>
            <div className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Users2 className="w-4 h-4 text-slate-400" />
          <span className="capitalize">{user.role}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.isActive ? "default" : "secondary"} className={
          user.isActive 
            ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200" 
            : "bg-slate-100 text-slate-500 hover:bg-slate-100 shadow-none border-slate-200"
        }>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500">
        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleStatus} className={user.isActive ? "text-destructive" : "text-green-600"}>
              {user.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" /> Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" /> Activate User
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const createUser = useCreateUser();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "admin",
      isActive: true,
      approvedBy: "System Admin"
    }
  });

  const onSubmit = (data: UserFormValues) => {
    createUser.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" {...form.register("email")} placeholder="user@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              defaultValue="admin" 
              onValueChange={(val) => form.setValue("role", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="btn-primary" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
