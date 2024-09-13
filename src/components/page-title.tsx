const PageTitle = ({ title }: { title: string }) => {
  return (
    <div className="bg-secondary p-3 sm:p-4 rounded-md mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary">
        {title}
      </h1>
    </div>
  );
};

export default PageTitle;
