interface ThemeBodyProps {
  children: React.ReactNode;
}

const ThemeBody = ({ children }: ThemeBodyProps) => {
  return (
    <div className="min-h-screen transition-colors">
      {children}
    </div>
  );
};

export default ThemeBody;