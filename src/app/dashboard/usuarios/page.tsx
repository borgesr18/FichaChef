"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Users, Shield, Plus, Mail, Key, Trash2, UserCheck, Settings, TrendingUp } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useSupabase } from '@/components/providers/SupabaseProvider'

// Interface com index signature para compatibilidade com ModernTable
interface Usuario extends Record<string, unknown> {
  id: string
  userId: string
  nome?: string
  email?: string
  role: string
  createdAt: string
}

const FloatingLabelInput = ({ label, value, onChange, type = "text", required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isDateInput = type === "date"
  
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue || isDateInput
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

const FloatingLabelSelect = ({ label, value, onChange, options, required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 appearance-none"
      >
        <option value="">Selecione...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [resetMethod, setResetMethod] = useState<'direct' | 'email'>('email')
  const [newPassword, setNewPassword] = useState('')
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nome: '',
    role: 'cozinheiro' as string
  })
  const [inviteEmail, setInviteEmail] = useState('')

  // Usar contexto do SupabaseProvider
  const { userRole, loading: authLoading } = useSupabase()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await fetchUsuarios()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await fetch('/api/usuarios/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewUser({ email: '', password: '', nome: '', role: 'cozinheiro' })
        await fetchUsuarios()
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao criar usuário')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Erro ao criar usuário')
    } finally {
      setCreateLoading(false)
    }
  }

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)

    try {
      const response = await fetch('/api/usuarios/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      })

      if (response.ok) {
        setShowInviteModal(false)
        setInviteEmail('')
        alert('Convite enviado com sucesso!')
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao enviar convite')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Erro ao enviar convite')
    } finally {
      setInviteLoading(false)
    }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordResetLoading(true)

    try {
      let response: Response
      if (resetMethod === 'email') {
        response = await fetch('/api/usuarios/send-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedUser?.email
          })
        })
      } else {
        response = await fetch('/api/usuarios/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUser?.userId,
            newPassword: newPassword
          })
        })
      }

      if (response.ok) {
        setShowPasswordResetModal(false)
        setSelectedUser(null)
        setNewPassword('')
        alert(resetMethod === 'direct' ? 'Senha alterada com sucesso!' : 'Email de redefinição enviado!')
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao redefinir senha')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Erro ao redefinir senha')
    } finally {
      setPasswordResetLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchUsuarios()
        alert('Usuário excluído com sucesso!')
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário')
    }
  }

  // Calcular estatísticas
  const stats = {
    totalUsuarios: usuarios.length,
    chefs: usuarios.filter(u => u.role === 'chef').length,
    gerentes: usuarios.filter(u => u.role === 'gerente').length,
    cozinheiros: usuarios.filter(u => u.role === 'cozinheiro').length
  }

  // Aguardar carregamento da autenticação
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Verificação de role usando contexto
  if (userRole !== 'chef') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md mx-auto">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
              <p className="text-gray-600 mb-4">Apenas chefs podem gerenciar usuários.</p>
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Seu role atual:</strong> {userRole || 'não definido'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 mt-1">Gerencie usuários, permissões e convites do sistema</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Chefs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.chefs}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <UserCheck className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Gerentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.gerentes}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Cozinheiros</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cozinheiros}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-green-700 font-medium">
                  ✅ Acesso liberado como Chef - Você tem permissões completas
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <Mail size={20} />
                Convidar
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <Plus size={20} />
                Criar Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Lista de Usuários</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">Comece criando o primeiro usuário do sistema</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Papel</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Criado em</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{usuario.nome || 'Sem nome'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600">{usuario.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={usuario.role}
                          onChange={(e) => updateUserRole(usuario.userId, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                        >
                          <option value="cozinheiro">Cozinheiro</option>
                          <option value="gerente">Gerente</option>
                          <option value="chef">Chef</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 text-sm">
                          {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(usuario)
                              setShowPasswordResetModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Redefinir senha"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(usuario.userId)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Criar Novo Usuário"
        >
          <form onSubmit={createUser} className="space-y-6">
            <FloatingLabelInput
              label="Nome"
              type="text"
              value={newUser.nome}
              onChange={(value) => setNewUser({ ...newUser, nome: value })}
              required
            />
            <FloatingLabelInput
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(value) => setNewUser({ ...newUser, email: value })}
              required
            />
            <FloatingLabelInput
              label="Senha"
              type="password"
              value={newUser.password}
              onChange={(value) => setNewUser({ ...newUser, password: value })}
              required
            />
            <FloatingLabelSelect
              label="Papel"
              value={newUser.role}
              onChange={(value) => setNewUser({ ...newUser, role: value })}
              options={[
                { value: 'cozinheiro', label: 'Cozinheiro' },
                { value: 'gerente', label: 'Gerente' },
                { value: 'chef', label: 'Chef' }
              ]}
            />
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
              >
                {createLoading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Invite Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Convidar Usuário"
        >
          <form onSubmit={sendInvite} className="space-y-6">
            <FloatingLabelInput
              label="Email do convidado"
              type="email"
              value={inviteEmail}
              onChange={(value) => setInviteEmail(value)}
              required
            />
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={inviteLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
              >
                {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Password Reset Modal */}
        <Modal
          isOpen={showPasswordResetModal}
          onClose={() => setShowPasswordResetModal(false)}
          title="Redefinir Senha"
        >
          <form onSubmit={resetPassword} className="space-y-6">
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Usuário:</strong> {selectedUser?.nome} ({selectedUser?.email})
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Método de redefinição
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <input
                    type="radio"
                    value="email"
                    checked={resetMethod === 'email'}
                    onChange={(e) => setResetMethod(e.target.value as 'email')}
                    className="mr-3 text-[#5AC8FA] focus:ring-[#5AC8FA]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Enviar email de redefinição</div>
                    <div className="text-sm text-gray-600">O usuário receberá um link para redefinir a senha</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <input
                    type="radio"
                    value="direct"
                    checked={resetMethod === 'direct'}
                    onChange={(e) => setResetMethod(e.target.value as 'direct')}
                    className="mr-3 text-[#5AC8FA] focus:ring-[#5AC8FA]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Definir nova senha diretamente</div>
                    <div className="text-sm text-gray-600">Você define uma nova senha para o usuário</div>
                  </div>
                </label>
              </div>
            </div>

            {resetMethod === 'direct' && (
              <FloatingLabelInput
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={(value) => setNewPassword(value)}
                required
              />
            )}

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={passwordResetLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
              >
                {passwordResetLoading ? 'Processando...' : (resetMethod === 'direct' ? 'Alterar Senha' : 'Enviar Email')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
