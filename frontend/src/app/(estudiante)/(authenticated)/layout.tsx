import React from 'react';
import { StudentLayoutClient } from '@/components/layout/StudentLayoutClient';

export const instant = false;

export default function AuthenticatedStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
