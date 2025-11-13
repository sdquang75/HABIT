// Đây là Backend "scale" cho việc Check-in
// Đường dẫn: POST /api/logs

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

// === CHECK-IN MỘT HABIT (Tính năng #14) ===
export async function POST(request: Request) {
  // 1. Xác thực (Authenticate)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Lấy data từ body
  let data;
  try {
    data = await request.json();
    // Ví dụ: { "habitId": "cl...", "date": "2025-11-10T00:00:00.000Z", "value": 1 }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { habitId, date, value } = data;

  if (!habitId || !date) {
    return NextResponse.json({ error: 'habitId and date are required' }, { status: 400 });
  }

  try {
    // 3. Ủy quyền (Authorize) - KIỂM TRA BẢO MẬT QUAN TRỌNG
    // Đảm bảo habit này thuộc về user đang đăng nhập
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    if (habit.userId !== userId) {
      // User này không sở hữu habit này
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Ghi vào Database (Dùng UPSERT để tránh lỗi bấm 2 lần)
    // Nó sẽ tìm một log khớp với habitId VÀ date
    const newLog = await prisma.habitLog.upsert({
      where: {
        // Dùng unique constraint chúng ta đã tạo trong schema
        habitId_date: {
          habitId: habitId,
          date: new Date(date), // Đảm bảo đây là đối tượng Date
        },
      },
      // Nếu không tìm thấy, tạo mới
      create: {
        habitId: habitId,
        date: new Date(date),
        value: value || 1, // Dùng value được cung cấp, hoặc 1
      },
      // Nếu đã tìm thấy (đã check-in rồi), chỉ cập nhật value
      update: {
        value: value || 1,
      },
    });

    // 5. Trả về log vừa tạo/cập nhật
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi log habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}