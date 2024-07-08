const Meeting = async ({ params }: { params: { url: string } }) => {
  const url = decodeURIComponent(params.url);

  return (
    <iframe
      className="w-full max-w-4xl h-96 md:h-[540px] lg:h-[720px] rounded-lg shadow-lg border-none"
      src={url}
      title="Embedded Meeting"
      allow="camera;microphone;display-capture"
    ></iframe>
  );
};

export default Meeting;
