interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Olá, {userName}! 👋
        </h1>
        <p className="text-primary-foreground/80 text-lg">
          Sua jornada de autoconhecimento
        </p>
      </div>
    </header>
  );
};

export default DashboardHeader;
