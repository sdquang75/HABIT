// 1. CHUYỂN THÀNH CLIENT COMPONENT
'use client';

import type { Habit, HabitLog } from '@prisma/client'; // Import thêm kiểu 'HabitLog'
import { useState } from 'react';

// 2. Định nghĩa kiểu dữ liệu MỚI
// Kiểu Habit giờ sẽ bao gồm cả HabitLogs (nhờ Bước 1)
type HabitWithLogs = Habit & {
  habitLogs: HabitLog[];
};

// 3. Nhận 'habits' VÀ 'onHabitUpdated' (hàm mutate)
export function HabitList({
  habits,
  onHabitUpdated,
}: {
  habits: HabitWithLogs[];
  onHabitUpdated: () => void;
}) {
  // State để disable nút khi đang gọi API
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  // 4. Lấy ngày hôm nay (phải là 00:00:00)
  const getTodayAtMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // 5. Hàm xử lý Check-in (gọi API logs/route.ts)
  const handleCheckIn = async (habitId: string) => {
    if (loadingHabitId) return; // Không cho bấm khi đang xử lý

    setLoadingHabitId(habitId);

    try {
      const today = getTodayAtMidnight();

      // Gọi API POST /api/logs (file app/api/logs/route.ts (đang mở))
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId: habitId,
          date: today.toISOString(), // Gửi ngày hôm nay (dạng string)
          value: 1, // Mặc định là 1 lần
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể check-in');
      }

      // 6. Nếu thành công, gọi 'mutate' để refresh lại list
      onHabitUpdated();

    } catch (error) {
      console.error(error);
      // Cần thêm xử lý lỗi UI ở đây
    } finally {
      setLoadingHabitId(null);
    }
  };

  if (habits.length === 0) {
    return (
      <p className="text-grey-400 mt-4">
        Bạn chưa có thói quen nào. Hãy tạo một cái!
      </p>
    );
  }

  // 7. Render danh sách VỚI NÚT CHECK
  return (
    <div className="w-full max-w-md space-y-2">
      {habits.map((habit) => {
        // 8. Tính toán xem hôm nay đã xong chưa
        // (Nhờ Bước 1, habit.habitLogs giờ chỉ chứa log của hôm nay)
        const isDoneToday = habit.habitLogs.length > 0;
        const isLoading = loadingHabitId === habit.id;

        return (
          <div
            key={habit.id}
            className="bg-white-800 p-4 rounded flex justify-between items-center"
          >
            <span className="font-medium">{habit.title}</span>

            {/* === NÚT CHECK-IN MỚI === */}
            <button
              onClick={() => handleCheckIn(habit.id)}
              disabled={isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isDoneToday
                  ? 'bg-green-500 text-white' // Đã xong
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600' // Chưa xong
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                // Spinner đơn giản
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : isDoneToday ? (
                // Dấu check
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                // Vòng tròn (tượng trưng)
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}