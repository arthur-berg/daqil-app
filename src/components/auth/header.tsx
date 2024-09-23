type HeaderProps = {
  label: string;
};

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo.png"
        alt="daqil"
        className="w-[60%] sm:w-full"
      />

      <p className="text-muted-foreground text-xl">{label}</p>
    </div>
  );
};
