'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Users, Shield, Plus, Mail, Trash2, Key } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface Usuario {
  id: string
  userId: string
  nome?: string
  email?: string
  role: string
  createdAt: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ role?: string } | null>(null)
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

  useEffect(() => {
    fetchUsuarios()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/perfil-usuario')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

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
        alert(`Erro ao criar usuário: ${error.error}`)
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
        alert(`Erro ao enviar convite: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Erro ao enviar convite')
    } finally {
      setInviteLoading(false)
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
      } else {
        const error = await response.json()
        alert(`Erro ao excluir usuário: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const openPasswordResetModal = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setShowPasswordResetModal(true)
    setResetMethod('email')
    setNewPassword('')
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setPasswordResetLoading(true)

    try {
      const endpoint = resetMethod === 'direct' ? 'reset-password' : 'send-password-reset'
      const body = resetMethod === 'direct' 
        ? { userId: selectedUser.userId, newPassword }
        : { email: selectedUser.email }

      const response = await fetch(`/api/usuarios/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        setShowPasswordResetModal(false)
        setSelectedUser(null)
        setNewPassword('')
        alert(data.message || 'Senha redefinida com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro ao redefinir senha: ${error.error}`)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Erro ao redefinir senha')
    } finally {
      setPasswordResetLoading(false)
    }
  }

  if (currentUser && currentUser.role !== 'chef') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Apenas chefs podem gerenciar usuários.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Convidar Usuário
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Usuário
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Papel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={usuario.role}
                        onChange={(e) => updateUserRole(usuario.userId, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="cozinheiro">Cozinheiro</option>
                        <option value="gerente">Gerente</option>
                        <option value="chef">Chef</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openPasswordResetModal(usuario)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Redefinir senha"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para Criar Usuário */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Criar Novo Usuário"
        >
          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@exemplo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papel
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cozinheiro">Cozinheiro</option>
                <option value="gerente">Gerente</option>
                <option value="chef">Chef</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {createLoading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal para Convidar Usuário */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Convidar Usuário"
        >
          <form onSubmit={sendInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do Usuário
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@exemplo.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Um email de convite será enviado com instruções para criar a conta.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal para Redefinir Senha */}
        <Modal
          isOpen={showPasswordResetModal}
          onClose={() => setShowPasswordResetModal(false)}
          title="Redefinir Senha"
        >
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Redefinindo senha para: <strong>{selectedUser?.nome || selectedUser?.email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Redefinição
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resetMethod"
                    value="email"
                    checked={resetMethod === 'email'}
                    onChange={(e) => setResetMethod(e.target.value as 'direct' | 'email')}
                    className="mr-2"
                  />
                  <span className="text-sm">Enviar email de redefinição</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resetMethod"
                    value="direct"
                    checked={resetMethod === 'direct'}
                    onChange={(e) => setResetMethod(e.target.value as 'direct' | 'email')}
                    className="mr-2"
                  />
                  <span className="text-sm">Definir nova senha diretamente</span>
                </label>
              </div>
            </div>

            {resetMethod === 'email' && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  Um email será enviado para <strong>{selectedUser?.email}</strong> com instruções para redefinir a senha.
                </p>
              </div>
            )}

            {resetMethod === 'direct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="mt-1 text-sm text-gray-500">
                  A senha será alterada imediatamente.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={passwordResetLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md disabled:opacity-50"
              >
                {passwordResetLoading ? 'Processando...' : 
                 resetMethod === 'email' ? 'Enviar Email' : 'Redefinir Senha'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
