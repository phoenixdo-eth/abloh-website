export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {children}
    </div>
  );
}
