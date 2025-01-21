import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    jwt(params) {
      console.debug('jwt', params)
      const { token, profile } = params
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }
      return token
    },
    session: params => {
      console.debug('session', params)
      const { session, token } = params
      if (session?.user) {
        session.user.id = token?.id ? String(token.id) : String(token.sub)
      }
      return session
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
