// Đây là Backend "scale" của cậu (REST API)
// Đường dẫn: /api/habits

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// Bỏ import không dùng nữa
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
// Import authOptions từ file gốc (đang mở)
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// === LẤY DANH SÁCH HABITS (Tính năng #10) - CẬP NHẬT ===
export async function GET(request: Request) {
  // 1. Xác thực
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // === LOGIC MỚI: Lấy ngày hôm nay ===
  // Chúng ta cần lấy log chỉ của ngày hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt về 00:00:00 hôm nay
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Lấy 00:00:00 ngày mai

  // 2. Đọc Database (Cập nhật: Dùng 'include' để lấy log hôm nay)
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      // === CẬP NHẬT QUAN TRỌNG ===
      include: {
        // Lấy các habitLogs liên quan
        habitLogs: {
          where: {
            // Nhưng chỉ lấy các log
            date: {
              gte: today, // Lớn hơn hoặc bằng 00:00 hôm nay
              lt: tomorrow, // Và nhỏ hơn 00:00 ngày mai
            },
          },
        },
      },
      // === KẾT THÚC CẬP NHẬT ===
    });
    // 3. Trả về JSON (habits giờ sẽ có habitLogs: [ ...log hôm nay... ])
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Lỗi khi lấy habits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// === TẠO HABIT MỚI (Tính năng #6) ===
export async function POST(request: Request) {
  // 1. Xác thực
  const session = await getServerSession(authOptions);
// ... (Phần POST giữ nguyên, không thay đổi) ...
// [Immersive content redacted for brevity.]
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Lấy data từ body (thay vì FormData)
  let data;
  try {
    data = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title } = data;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // 3. Ghi vào Database
  try {
    const newHabit = await prisma.habit.create({
      data: {
        title: title,
        userId: userId,
        specificDays: [],
      },
    });
    // 4. Trả về habit vừa tạo (chuẩn REST)
    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}