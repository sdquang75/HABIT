import { PrismaClient } from '@prisma/client';

// Khai báo một biến global để giữ instance của PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Khởi tạo PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Log các query ra console khi ở môi trường dev
  });

// Nếu không phải production, gán instance vào biến global
// Kỹ thuật này ngăn Next.js tạo ra quá nhiều instance PrismaClient
// trong quá trình "hot-reload" ở development.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export instance đã được khởi tạo
export default prisma;