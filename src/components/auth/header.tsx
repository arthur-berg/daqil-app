type HeaderProps = {
  label: string;
};

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/zakina-logo.png" alt="zakina" />
      {/* <h1 className="text-3xl font-semibold">Zakina</h1> */}
      <p className="text-muted-foreground text-lg">{label}</p>
    </div>
  );
};
