"use client";

import { AuthProvider as AuthContextProvider } from '@/context/AuthContext';
import { ProductProvider } from "@/context/ProductContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { ProductModalProvider } from "@/context/ProductModalContext";
import { AchievementProvider } from "@/context/AchievementContext";
import TawkToChat from "@/components/chat/TawkToChat";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <ProductProvider>
        <CategoryProvider>
          <ProductModalProvider>
            <AchievementProvider>
              {children}
              <TawkToChat />
            </AchievementProvider>
          </ProductModalProvider>
        </CategoryProvider>
      </ProductProvider>
    </AuthContextProvider>
  );
}
