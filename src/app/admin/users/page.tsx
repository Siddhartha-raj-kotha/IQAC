"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { AppShell } from "@/components/AppShell";
import { Toast } from "@/components/Toast";
import { getAllUsers, saveUsers, User, departments } from "@/lib/mockData";
import { t } from "@/lib/translations";
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";

const roleOptions = ["faculty", "hod", "principal", "admin"] as const;

export default function UserManagementPage() {
  const { user, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const e = lang === "en";

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "faculty", department: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.replace("/login");
    setUsers(getAllUsers());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "faculty", department: "" });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: u.password, role: u.role, department: u.department });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) {
      setToast({ msg: e ? "Name, email and role are required." : "పేరు, ఇమెయిల్ మరియు పాత్ర తప్పనిసరి.", type: "error" });
      return;
    }
    let newUsers = [...users];
    if (editing) {
      const idx = newUsers.findIndex(u => u.id === editing.id);
      if (idx !== -1) {
        newUsers[idx] = { ...newUsers[idx], ...form } as User;
      }
      setToast({ msg: e ? "User updated successfully!" : "వినియోగదారు నవీకరించబడ్డారు!", type: "success" });
    } else {
      const newUser: User = { id: `u${Date.now()}`, ...form } as User;
      newUsers.push(newUser);
      setToast({ msg: e ? "User added successfully!" : "వినియోగదారు జోడించబడ్డారు!", type: "success" });
    }
    setUsers(newUsers);
    saveUsers(newUsers);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm(e ? "Delete this user?" : "ఈ వినియోగదారుని తొలగించాలా?")) return;
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    saveUsers(newUsers);
    setToast({ msg: e ? "User deleted." : "వినియోగదారు తొలగించబడ్డారు.", type: "success" });
  };

  const roleBadge: Record<string, string> = {
    faculty: "bg-blue-100 text-blue-800",
    hod: "bg-green-100 text-green-800",
    principal: "bg-purple-100 text-purple-800",
    admin: "bg-red-100 text-red-800",
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="ku-header rounded-2xl p-6 text-white flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("userManagement", lang)}</h1>
            <p className="text-white/60 text-sm mt-1">{e ? "Add, edit, or remove users and assign departments." : "వినియోగదారులను జోడించండి, సవరించండి లేదా తొలగించండి."}</p>
          </div>
          <button className="btn btn-gold flex items-center gap-2" onClick={openAdd}>
            <UserPlus size={18} /> {t("addUser", lang)}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roleOptions.map(role => (
            <div key={role} className="card p-4 text-center">
              <p className="text-sm text-gray-500 capitalize">{role === "hod" ? "HOD" : role.charAt(0).toUpperCase() + role.slice(1)}{role === "faculty" || role === "hod" ? "s" : ""}</p>
              <p className="text-3xl font-black text-ku-navy">{users.filter(u => u.role === role).length}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-9 py-2 text-sm" placeholder={e ? "Search users by name, email or department..." : "పేరు, ఇమెయిల్ లేదా విభాగం ద్వారా శోధించండి..."} value={search} onChange={ex => setSearch(ex.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dynamic-table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{e ? "Name" : "పేరు"}</th>
                  <th>{e ? "Email" : "ఇమెయిల్"}</th>
                  <th>{e ? "Role" : "పాత్ర"}</th>
                  <th>{e ? "Department" : "విభాగం"}</th>
                  <th>{e ? "Actions" : "చర్యలు"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td className="text-center text-gray-400">{i + 1}</td>
                    <td className="font-semibold text-ku-navy">{u.name}</td>
                    <td className="text-sm text-gray-600">{u.email}</td>
                    <td>
                      <span className={`badge text-xs ${roleBadge[u.role]}`}>
                        {u.role === "hod" ? "HOD" : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{u.department}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" onClick={() => openEdit(u)} title="Edit"><Pencil size={15} /></button>
                        <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(u.id)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form settings card */}
        <div className="card p-6">
          <h3 className="font-bold text-ku-navy mb-4">{t("formPeriod", lang)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("formOpenDate", lang)}</label>
              <input type="date" className="form-input" defaultValue="2024-06-01" />
            </div>
            <div>
              <label className="form-label">{t("formCloseDate", lang)}</label>
              <input type="date" className="form-input" defaultValue="2025-05-31" />
            </div>
          </div>
          <button className="btn btn-primary mt-4">{e ? "Save Settings" : "సెట్టింగులు సేవ్ చేయి"}</button>
        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <h3 className="text-xl font-bold text-ku-navy mb-5">
              {editing ? (e ? "Edit User" : "వినియోగదారుని సవరించు") : (e ? "Add New User" : "నూతన వినియోగదారుని జోడించు")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">{e ? "Full Name" : "పూర్తి పేరు"} *</label>
                <input className="form-input" value={form.name} onChange={ex => setForm(f => ({ ...f, name: ex.target.value }))} placeholder={e ? "e.g. Dr. Ramesh Kumar" : "ఉదా. Dr. రమేష్ కుమార్"} />
              </div>
              <div>
                <label className="form-label">{e ? "Email" : "ఇమెయిల్"} *</label>
                <input type="email" className="form-input" value={form.email} onChange={ex => setForm(f => ({ ...f, email: ex.target.value }))} placeholder="name@ku.ac.in" />
              </div>
              <div>
                <label className="form-label">{e ? "Password" : "పాస్వర్డ్"} *</label>
                <input type="text" className="form-input" value={form.password} onChange={ex => setForm(f => ({ ...f, password: ex.target.value }))} placeholder={e ? "Set a password" : "పాస్వర్డ్ సెట్ చేయండి"} />
              </div>
              <div>
                <label className="form-label">{e ? "Role" : "పాత్ర"} *</label>
                <select className="form-select" value={form.role} onChange={ex => setForm(f => ({ ...f, role: ex.target.value }))}>
                  <option value="faculty">{e ? "Faculty" : "అధ్యాపకుడు"}</option>
                  <option value="hod">{e ? "Head of Department (HOD)" : "విభాగ అధిపతి (HOD)"}</option>
                  <option value="principal">{e ? "Principal" : "ప్రిన్సిపాల్"}</option>
                  <option value="admin">{e ? "IQAC Admin" : "IQAC అడ్మిన్"}</option>
                </select>
              </div>
              <div>
                <label className="form-label">{e ? "Department" : "విభాగం"}</label>
                <select className="form-select" value={form.department} onChange={ex => setForm(f => ({ ...f, department: ex.target.value }))}>
                  <option value="">{e ? "Select department..." : "విభాగం ఎంచుకోండి..."}</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="All">{e ? "All Departments (Principal/Admin)" : "అన్ని విభాగాలు"}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel", lang)}</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? t("save", lang) : t("addUser", lang)}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
