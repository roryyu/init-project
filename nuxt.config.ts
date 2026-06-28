// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@element-plus/nuxt',
    '@sidebase/nuxt-auth',
  ],

  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'local',
      token: {
        signInResponseTokenPointer: '/token',
        maxAgeInSeconds: 60 * 60 * 24, // 24 hours
      },
      endpoints: {
        signIn: { path: '/auth/login', method: 'post' },
        signOut: { path: '/auth/logout', method: 'post' },
        signUp: { path: '/auth/register', method: 'post' },
        getSession: { path: '/auth/me', method: 'get' },
      },
    },
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: true,
    },
  },

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
  },
})
