import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { hashPassword, generateToken } from '~/server/utils/auth'

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(1, '请输入姓名').optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: '该邮箱已被注册',
    })
  }

  const hashedPassword = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      name: body.name,
    },
  })

  const token = generateToken({ userId: user.id, email: user.email })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }
})
