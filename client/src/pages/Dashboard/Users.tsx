import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users2,
  MoreHorizontal,
  UserX,
  UserCheck,
  Trash2,
  Search,
  Plus,
  Users,
} from "lucide-react";
import { format } from "date-fns";

/* ---------------- TYPES ---------------- */
interface User {
  id: string;
  name: string;
  email: string;
  role: "member" | "moderator" | "admin";
  isActive: boolean;
  approvedAt?: Timestamp;
}

/* ---------------- UTIL ---------------- */
const getInitials = (name = ""): string => {
  const p = name.trim().split(" ");
  return p.length === 1
    ? p[0][0]?.toUpperCase() ?? ""
    : (p[0][0] + p[1][0]).toUpperCase();
};

/* =========================
   MAIN PAGE
========================= */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<User["role"]>("member");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "approved_users"), (snap) => {
      const data: User[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<User, "id">),
      }));

      setUsers(data.filter((u) => u.role !== "admin"));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const addUser = async () => {
    if (!name || !email) return;

    await addDoc(collection(db, "approved_users"), {
      name,
      email,
      role,
      isActive: true,
      approvedAt: serverTimestamp(),
    });

    setName("");
    setEmail("");
    setRole("member");
    setOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage active users (admins excluded)
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* TABLE CARD */}
      <div className="dashboard-card p-0 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b flex gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left w-[35%]">User</th>
                <th className="px-6 py-4 text-left w-[20%]">Role</th>
                <th className="px-6 py-4 text-left w-[15%]">Status</th>
                <th className="px-6 py-4 text-left w-[20%]">Approved</th>
                <th className="px-6 py-4 text-right w-[10%]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="mx-auto mb-2 text-slate-400" />
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="roleSelect" className="sr-only">
              Select role
            </label>

            <select
              id="roleSelect"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as User["role"])
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
            </select>

            <Button className="w-full" onClick={addUser}>
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================
   USER ROW
========================= */
function UserRow({ user }: { user: User }) {
  const toggleStatus = async () => {
    await updateDoc(doc(db, "approved_users", user.id), {
      isActive: !user.isActive,
    });
  };

  const deleteUser = async () => {
    if (
      !confirm(`Delete ${user.name}? This cannot be undone.`)
    )
      return;

    await deleteDoc(doc(db, "approved_users", user.id));
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 capitalize">
        <Users2 className="inline w-4 h-4 mr-2 text-slate-400" />
        {user.role}
      </td>

      <td className="px-6 py-4">
        <Badge
          className={
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">
        {user.approvedAt
          ? format(user.approvedAt.toDate(), "MMM d, yyyy")
          : "-"}
      </td>

      <td className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleStatus}>
              {user.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" /> Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" /> Activate
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={deleteUser}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
