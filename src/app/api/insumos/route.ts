import { createRouteHandler } from '@/lib/routeHandler'
import { createInsumo } from '@/lib/prisma/insumos/create'
import { updateInsumo } from '@/lib/prisma/insumos/update'
import { deleteInsumo } from '@/lib/prisma/insumos/delete'
import { getInsumos } from '@/lib/prisma/insumos/read'
import { getServerUser } from '@/lib/auth/getServerUser'
import { logUserAction } from '@/lib/audit/logUserAction'

export const { GET, POST, PUT, DELETE } = createRouteHandler({
  GET: async (request) => {
    const user = await getServerUser()
    const insumos = await getInsumos(user.id)
    return new Response(JSON.stringify(insumos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  POST: async (request) => {
    const user = await getServerUser()
    const data = await request.json()
    const insumo = await createInsumo(user.id, data)

    await logUserAction(user.id, 'create', 'insumos', insumo.id, 'insumo', data)
    return new Response(JSON.stringify(insumo), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  PUT: async (request) => {
    const user = await getServerUser()
    const data = await request.json()
    const updated = await updateInsumo(user.id, data)

    await logUserAction(user.id, 'update', 'insumos', updated.id, 'insumo', data)
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  DELETE: async (request) => {
    const user = await getServerUser()
    const data = await request.json()
    const deleted = await deleteInsumo(user.id, data.id)

    await logUserAction(user.id, 'delete', 'insumos', deleted.id, 'insumo', data)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
