import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
// Import prisma client đã tạo ở bước trước
import { prisma } from "@/lib/prisma"

export const authOptions = {
  // 1. Liên kết Prisma Adapter
  // NextAuth sẽ tự động dùng schema (User, Account, Session...) của cậu
  adapter: PrismaAdapter(prisma),
  
  // 2. Cấu hình Providers (Ví dụ: Google)
  // Đây là nơi cậu thêm các cách đăng nhập (Facebook, GitHub...)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  // 3. (Tùy chọn) Định nghĩa các trang custom
  // pages: {
  //   signIn: '/auth/signin',
  // },

  // 4. (Tùy chọn) Callbacks
  // Dùng để kiểm soát session hoặc JWT
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      // Thêm ID của user vào session để dùng ở client
      session.user.id = user.id;
      return session;
    },
  },
}

// Khởi tạo và export handlers
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }