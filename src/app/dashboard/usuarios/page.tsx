'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Users, Shield, Plus, Mail, Key } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Gerenciamento de Usuários</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-[1.02] transform"
            >
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Convidar Usuário</span>
              <span className="sm:hidden">Convidar</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-[1.02] transform"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Criar Usuário</span>
              <span className="sm:hidden">Criar</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
            <ModernTable
              columns={[
                { key: 'usuario', label: 'Usuário', sortable: true,
                  render: (_, row) => {
                    const usuario = row as unknown as Usuario
                    return (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                      </div>
                    )
                  }},
                { key: 'role', label: 'Papel', sortable: true,
                  render: (value, row) => {
                    const usuario = row as unknown as Usuario
                    return (
                      <select
                        value={value as string}
                        onChange={(e) => updateUserRole(usuario.userId, e.target.value)}
                        className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white hover:bg-slate-50 transition-colors duration-200"
                      >
                        <option value="cozinheiro">Cozinheiro</option>
                        <option value="gerente">Gerente</option>
                        <option value="chef">Chef</option>
                      </select>
                    )
                  }},
                { key: 'createdAt', label: 'Criado em', sortable: true,
                  render: (value) => new Date(value as string).toLocaleDateString('pt-BR') },
                { key: 'actions', label: 'Ações', align: 'center',
                  render: (_, row) => {
                    const usuario = row as unknown as Usuario
                    return (
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => openPasswordResetModal(usuario)}
                          className="p-2 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                          title="Redefinir senha"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  }}
              ]}
              data={usuarios as unknown as Record<string, unknown>[]}
              searchable={false}
              pagination={true}
              pageSize={10}
              loading={loading}
            />
          </div>
        )}

        {/* Modal para Criar Usuário */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Criar Novo Usuário"
        >
          <form onSubmit={createUser} className="space-y-4">
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
            
            <FloatingLabelInput
              label="Nome"
              value={newUser.nome}
              onChange={(value) => setNewUser({ ...newUser, nome: value })}
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
              required
            />
            
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {createLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Criando...</span>
                  </>
                ) : (
                  <span className="font-medium">Criar Usuário</span>
                )}
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
              <FloatingLabelInput
                label="Email do Usuário"
                type="email"
                value={inviteEmail}
                onChange={(value) => setInviteEmail(value)}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Um email de convite será enviado com instruções para criar a conta.
              </p>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {inviteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span className="font-medium">Enviar Convite</span>
                )}
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
                <FloatingLabelInput
                  label="Nova Senha"
                  type="password"
                  value={newPassword}
                  onChange={(value) => setNewPassword(value)}
                  required
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
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {passwordResetLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <span className="font-medium">{resetMethod === 'email' ? 'Enviar Email' : 'Redefinir Senha'}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
