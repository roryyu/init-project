import { prisma } from '~/server/utils/prisma'
import { getUserFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = getUserFromToken(event)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: '未授权',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    })
  }

  return { user }
})
