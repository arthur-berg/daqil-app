import WaitingRoom from "@/app/[locale]/(protected)/video/waiting-room";

const VideoPage = async () => {
  /*   const data = await createSession(); */
  /*   const response = await fetch(`http://localhost:3000/api/video/2`, {
    cache: "no-store",
    method: "GET",
  });
  if (!response.ok) {
    return <div>Error</div>;
  }

  const data = await response.json(); */
  {
    /* <VideoBody videoData={data} />; */
  }
  /*  const data = {
    sessionId:
      "1_MX44MjRiNzQyNy1iYjFmLTRkNjgtOGI2Zi0wNmQ5YTRjNTQ0YWR-fjE3MjA2MTczMzU4NjR-VVpZZjBLK0VwUlV3VVg3MllSM0p6OVg2fn5-",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNlc3Npb24uY29ubmVjdCIsInNlc3Npb25faWQiOiIxX01YNDRNalJpTnpReU55MWlZakZtTFRSa05qZ3RPR0kyWmkwd05tUTVZVFJqTlRRMFlXUi1makUzTWpBMk1UY3pNelU0TmpSLVZWcFpaakJMSzBWd1VsVjNWVmczTWxsU00wcDZPVmcyZm41LSIsInJvbGUiOiJwdWJsaXNoZXIiLCJpbml0aWFsX2xheW91dF9jbGFzc19saXN0IjoiIiwiZXhwIjoxNzIwNzAzNzM2LCJzdWIiOiJ2aWRlbyIsImFjbCI6eyJwYXRocyI6eyIvc2Vzc2lvbi8qKiI6e319fSwianRpIjoiMmRkNTEzMGQtOTA2Zi00MmMxLTlmNzctYWU0ZmE5M2IwODFkIiwiaWF0IjoxNzIwNjE3MzM1LCJhcHBsaWNhdGlvbl9pZCI6IjgyNGI3NDI3LWJiMWYtNGQ2OC04YjZmLTA2ZDlhNGM1NDRhZCJ9.O0YQSe-0xCNzvZUyENSPrzg3z_KMnHEJ-VX5uI6yhTrXCt25kJBooYqTKxd-DOeZENrkG81m4iXIM0zY0x0gMPWaVJuArWbRuVpBGfEzFr9GZM1EE2j91tTU7VYWwuD9AlTysJpLzmBgIK3ipKYgd2S7lHI1yuCXUw84fS5S0rSEG3OnNxHbf_Y8kolBMpBHpM65X2jtXG-gkPU-2kBvOUXhfnRJnzQVbRSfD3KuEVMbcFV4aZsQpfO_OBdiDuDLDrpHvhZzoWKW2w9TVDkCTtu2nZq1LLzZdinU2XDrpCbVkUY27uLjhNX6VuciLlFwhtLFRBkavOBJEaie914bvg",
    appId: "824b7427-bb1f-4d68-8b6f-06d9a4c544ad",
  };

  if (!data) return <div>Could not create session</div>; */

  return <WaitingRoom />; /*  <VideoBody data={data} />; */
};

export default VideoPage;
