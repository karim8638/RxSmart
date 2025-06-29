import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Edit,
  Trash2,
  Send,
  Copy,
  Check,
  Clock,
  X,
  Search,
  Filter,
  MoreVertical,
  Building2,
  Store,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  user_id: string;
  store_id: string;
  role_id: string;
  position: string;
  is_active: boolean;
  joined_at: string;
  users: {
    full_name: string;
    email: string;
    phone?: string;
    last_login?: string;
  };
  roles: {
    name: string;
    description: string;
  };
  stores: {
    name: string;
    code: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  roles: {
    name: string;
  };
  stores: {
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any;
}

interface Store {
  id: string;
  name: string;
  code: string;
}

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { appUser } = useAuthContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch team members
      const { data: membersData } = await supabase
        .from('store_members')
        .select(`
          *,
          users (full_name, email, phone, last_login),
          roles (name, description),
          stores (name, code)
        `)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      // Fetch invitations
      const { data: invitationsData } = await supabase
        .from('invitations')
        .select(`
          *,
          roles (name),
          stores (name)
        `)
        .order('created_at', { ascending: false });

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      // Fetch stores
      const { data: storesData } = await supabase
        .from('stores')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      setTeamMembers(membersData || []);
      setInvitations(invitationsData || []);
      setRoles(rolesData || []);
      setStores(storesData || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const InviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [inviteData, setInviteData] = useState({
      email: '',
      role_id: '',
      store_id: '',
      message: '',
    });
    const [sending, setSending] = useState(false);

    const handleSendInvite = async () => {
      setSending(true);
      try {
        const invitationToken = crypto.randomUUID();
        
        const { error } = await supabase
          .from('invitations')
          .insert({
            organization_id: appUser?.organization_id,
            store_id: inviteData.store_id,
            email: inviteData.email,
            role_id: inviteData.role_id,
            invited_by: appUser?.id,
            invitation_token: invitationToken,
          });

        if (error) throw error;

        // In a real app, you would send an email here
        alert(`Invitation sent to ${inviteData.email}!`);
        
        await fetchData();
        onClose();
      } catch (error) {
        console.error('Error sending invitation:', error);
        alert('Failed to send invitation. Please try again.');
      } finally {
        setSending(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="colleague@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store *
              </label>
              <select
                value={inviteData.store_id}
                onChange={(e) => setInviteData(prev => ({ ...prev, store_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={inviteData.role_id}
                onChange={(e) => setInviteData(prev => ({ ...prev, role_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select role</option>
                {roles.filter(role => !role.is_system_role || role.name !== 'super_admin').map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Welcome to our team! We're excited to have you join us."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={sending || !inviteData.email || !inviteData.store_id || !inviteData.role_id}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{sending ? 'Sending...' : 'Send Invite'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.users.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = storeFilter === 'all' || member.store_id === storeFilter;
    const matchesRole = roleFilter === 'all' || member.role_id === roleFilter;
    
    return matchesSearch && matchesStore && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your pharmacy team members and invitations</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teamMembers.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Stores</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stores.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
              <Store className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {invitations.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{roles.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Store</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {member.users.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.users.full_name}</p>
                        <p className="text-sm text-gray-600">{member.users.email}</p>
                        {member.users.phone && (
                          <p className="text-sm text-gray-500">{member.users.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{member.stores.name}</span>
                      <span className="text-sm text-gray-500">({member.stores.code})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Shield className="w-4 h-4 mr-1" />
                      {member.roles.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{member.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(member.joined_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.users.last_login 
                      ? format(new Date(member.users.last_login), 'MMM dd, yyyy')
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {invitations.filter(inv => inv.status === 'pending').map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-sm text-gray-600">
                        {invitation.roles.name} at {invitation.stores.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

export default TeamManagement;