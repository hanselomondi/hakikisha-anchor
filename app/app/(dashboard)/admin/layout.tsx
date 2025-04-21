import { FC, ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return <div className='bg-slate-200 rounded-md'>{children}</div>;
};

export default AdminLayout;