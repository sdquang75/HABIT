// Các component tương tác (signIn, signOut, useSession)
// BẮT BUỘC phải là Client Components
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

// Nút Đăng nhập
export function SignInButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Đăng nhập với Google
    </button>
  );
}

// Thông tin User và Nút Đăng xuất
export function SignOutButton() {
  // Lấy data session từ client
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        {/* Hiển thị ảnh đại diện */}
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User Avatar'}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-gray-600">{session.user.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // Nếu chưa đăng nhập, trả về null hoặc nút Đăng nhập (tùy logic)
  return null;
}

// Component tổng hợp để hiển thị đúng nút
export function AuthButtons() {
  const { data: session } = useSession();

  // Nếu đang loading session
  if (session === undefined) {
    return <div>Loading...</div>;
  }

  // Nếu đã đăng nhập, hiện nút SignOut
  // Nếu chưa đăng nhập, hiện nút SignIn
  return (
    <div>{session ? <SignOutButton /> : <SignInButton />}</div>
  );
}