
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Erreur", description: "Impossible de charger les utilisateurs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm) ||
    user.name?.toLowerCase().includes(searchTerm) ||
    user.phone?.toLowerCase().includes(searchTerm)
  );

  const toggleUserStatus = async (user, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ account_active: newStatus })
        .eq('id', user.id);
      if (error) throw error;
      toast({ title: "Succès", description: `Statut de ${user.username} mis à jour.` });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };
  
  const toggleAdminStatus = async (user, isAdmin) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', user.id);
      if (error) throw error;
      toast({ title: "Succès", description: `Permissions admin de ${user.username} mises à jour.` });
      fetchUsers(); 
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour les permissions admin.", variant: "destructive" });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({...user});
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editingUser.name,
          username: editingUser.username,
          email: editingUser.email,
          phone: editingUser.phone,
          balance: parseFloat(editingUser.balance) || 0,
          withdrawable_balance: parseFloat(editingUser.withdrawable_balance) || 0,
          youtube_balance: parseFloat(editingUser.youtube_balance) || 0,
          tiktok_balance: parseFloat(editingUser.tiktok_balance) || 0,
        })
        .eq('id', editingUser.id);
      if (error) throw error;
      toast({ title: "Succès", description: `Utilisateur ${editingUser.username} mis à jour.` });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'utilisateur.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId) => {
     if(!deleteConfirmUser || deleteConfirmUser.id !== userId) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      toast({ title: "Succès", description: "Utilisateur supprimé." });
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'utilisateur. Vérifiez les dépendances (parrainages, retraits).", variant: "destructive" });
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-green-400 to-red-400"
      >
        Gestion des Utilisateurs
      </motion.h1>

      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass-effect-darker border border-slate-700/50 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/30">
              <TableHead className="text-sky-300">Nom d'utilisateur</TableHead>
              <TableHead className="text-sky-300">Email</TableHead>
              <TableHead className="text-sky-300">Téléphone</TableHead>
              <TableHead className="text-sky-300">Statut</TableHead>
              <TableHead className="text-sky-300">Admin</TableHead>
              <TableHead className="text-sky-300">Solde</TableHead>
              <TableHead className="text-sky-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/50 transition-colors">
                <TableCell className="text-sky-100">{user.username}</TableCell>
                <TableCell className="text-sky-200">{user.email}</TableCell>
                <TableCell className="text-sky-200">{user.phone}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${user.account_active ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                    {user.account_active ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleAdminStatus(user, !user.is_admin)}
                    className={user.is_admin ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}
                  >
                    {user.is_admin ? <UserCheck className="h-4 w-4 mr-1"/> : <UserX className="h-4 w-4 mr-1"/>}
                    {user.is_admin ? 'Oui' : 'Non'}
                  </Button>
                </TableCell>
                <TableCell className="text-sky-200">{(user.withdrawable_balance || 0).toLocaleString()} FCFA</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="outline" size="icon" className="border-sky-400 text-sky-300 hover:bg-sky-400/20 h-8 w-8" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className={`border-red-400 text-red-300 hover:bg-red-400/20 h-8 w-8 ${user.account_active ? '' : 'hidden'}`} onClick={() => toggleUserStatus(user, false)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                   <Button variant="outline" size="icon" className={`border-green-400 text-green-300 hover:bg-green-400/20 h-8 w-8 ${!user.account_active ? '' : 'hidden'}`} onClick={() => toggleUserStatus(user, true)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Dialog open={!!deleteConfirmUser && deleteConfirmUser.id === user.id} onOpenChange={() => setDeleteConfirmUser(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8" onClick={() => setDeleteConfirmUser(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Voulez-vous vraiment supprimer l'utilisateur {deleteConfirmUser?.username}? Cette action est irréversible.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteConfirmUser(null)} className="text-slate-300 hover:bg-slate-700">Annuler</Button>
                        <Button variant="destructive" onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">Supprimer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur: {editingUser.username}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right col-span-1 text-slate-300">Nom</Label>
                <Input id="name" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username-edit" className="text-right col-span-1 text-slate-300">Nom d'utilisateur</Label>
                <Input id="username-edit" value={editingUser.username} onChange={(e) => setEditingUser({...editingUser, username: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-edit" className="text-right col-span-1 text-slate-300">Email</Label>
                <Input id="email-edit" type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone-edit" className="text-right col-span-1 text-slate-300">Téléphone</Label>
                <Input id="phone-edit" type="tel" value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balance-edit" className="text-right col-span-1 text-slate-300">Solde retirable</Label>
                <Input id="balance-edit" type="number" value={editingUser.withdrawable_balance || 0} onChange={(e) => setEditingUser({...editingUser, withdrawable_balance: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="yt-balance-edit" className="text-right col-span-1 text-slate-300">Solde YT</Label>
                <Input id="yt-balance-edit" type="number" value={editingUser.youtube_balance || 0} onChange={(e) => setEditingUser({...editingUser, youtube_balance: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tt-balance-edit" className="text-right col-span-1 text-slate-300">Solde TikTok</Label>
                <Input id="tt-balance-edit" type="number" value={editingUser.tiktok_balance || 0} onChange={(e) => setEditingUser({...editingUser, tiktok_balance: e.target.value })} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Annuler</Button>
              </DialogClose>
              <Button onClick={handleSaveEdit} className="bg-sky-600 hover:bg-sky-700">Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default AdminUsers;
