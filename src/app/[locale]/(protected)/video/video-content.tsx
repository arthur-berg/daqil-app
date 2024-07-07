"use client";
import OT from "@opentok/client";
import { useEffect } from "react";

const handleError = (error: any) => {
  if (error) {
    alert(error.message);
  }
};

const VideoContent = () => {
  const appId = "824b7427-bb1f-4d68-8b6f-06d9a4c544ad";
  const sessionId =
    "1_MX44MjRiNzQyNy1iYjFmLTRkNjgtOGI2Zi0wNmQ5YTRjNTQ0YWR-fjE3MjAzNzEwNDc4NTJ-Rnc0Qkk0S2FxRUdFTjVOVXdvcEJ0cGV4flB-fg";
  const token =
    "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYW51YmlzLWNlcnRzLWMxLWV1dzEucHJvZC52MS52b25hZ2VuZXR3b3Jrcy5uZXQvandrcyIsImtpZCI6IkNOPVZvbmFnZSAxdmFwaWd3IEludGVybmFsIENBOjoyNjQ1MTM4Njk1ODIwNjkwOTI4NTgyMjcwMDQ5NzQ0NDY2NjM1NTQiLCJ0eXAiOiJKV1QiLCJ4NXUiOiJodHRwczovL2FudWJpcy1jZXJ0cy1jMS1ldXcxLnByb2QudjEudm9uYWdlbmV0d29ya3MubmV0L3YxL2NlcnRzL2QzZDYxMjYxZDI4ODcyZDUwNGRkZDIwM2IwMDNkZjY1In0.eyJwcmluY2lwYWwiOnsiYWNsIjp7InBhdGhzIjp7Ii8qKiI6e319fSwidmlhbUlkIjp7ImVtYWlsIjoiYXJ0aHVyd2JlcmdAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkFydGh1ciIsImZhbWlseV9uYW1lIjoiQmVyZyIsInBob25lX251bWJlciI6IjQ2NzA3NzY2NTg5IiwicGhvbmVfbnVtYmVyX2NvdW50cnkiOiJTRSIsIm9yZ2FuaXphdGlvbl9pZCI6Ijk4MTQxNGE5LTJmZDQtNGQxOC1iMzdiLTQ4ZTFkOWNhMDA3YiIsImF1dGhlbnRpY2F0aW9uTWV0aG9kcyI6W3siY29tcGxldGVkX2F0IjoiMjAyNC0wNy0wN1QxNjo0ODo1Ny42NzUzMDE3OTJaIiwibWV0aG9kIjoiaW50ZXJuYWwifV0sInRva2VuVHlwZSI6InZpYW0iLCJhdWQiOiJwb3J0dW51cy5pZHAudm9uYWdlLmNvbSIsImV4cCI6MTcyMDM3MTM0NywianRpIjoiMWRjNmJiNDYtOWU0MC00OGZhLTk2Y2MtZTRhMmRjNGRhZWNiIiwiaWF0IjoxNzIwMzcxMDQ3LCJpc3MiOiJWSUFNLUlBUCIsIm5iZiI6MTcyMDM3MTAzMiwic3ViIjoiMWFiOWIwY2YtYmJmYS00NjY3LTlhNGEtZTljMGRiM2I2YjU0In19LCJmZWRlcmF0ZWRBc3NlcnRpb25zIjp7InZpZGVvLWFwaSI6W3siYXBpS2V5IjoiMmY0ZDNjNzIiLCJhcHBsaWNhdGlvbklkIjoiODI0Yjc0MjctYmIxZi00ZDY4LThiNmYtMDZkOWE0YzU0NGFkIiwiZXh0cmFDb25maWciOnsidmlkZW8tYXBpIjp7ImluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3QiOiIiLCJyb2xlIjoibW9kZXJhdG9yIiwic2NvcGUiOiJzZXNzaW9uLmNvbm5lY3QiLCJzZXNzaW9uX2lkIjoiMV9NWDQ0TWpSaU56UXlOeTFpWWpGbUxUUmtOamd0T0dJMlppMHdObVE1WVRSak5UUTBZV1ItZmpFM01qQXpOekV3TkRjNE5USi1SbmMwUWtrMFMyRnhSVWRGVGpWT1ZYZHZjRUowY0dWNGZsQi1mZyJ9fX1dfSwiYXVkIjoicG9ydHVudXMuaWRwLnZvbmFnZS5jb20iLCJleHAiOjE3MjAzNzQ2NDgsImp0aSI6IjBlYjhiM2I3LTE1MWQtNDEwZi05YzcxLThhM2IyNmZiYzM1ZSIsImlhdCI6MTcyMDM3MTA0OCwiaXNzIjoiVklBTS1JQVAiLCJuYmYiOjE3MjAzNzEwMzMsInN1YiI6IjFhYjliMGNmLWJiZmEtNDY2Ny05YTRhLWU5YzBkYjNiNmI1NCJ9.pVw1_mNXes0FqmFWRC9XxJPBaPPrFdSkDDVEDI-7ztSpVtuMC7ApCfwky6hKBpFcfeEEHLx9hs-umgs00Ey20P2w9ECzphctNpnfkg0J5NSygr0VW2MZnBlU49h4iTWSjTWILkOZ-GZ8PKUIdMHso5zbi7i8BCT4_dZNiWsN5uQAchVQYn1aewoNX7LKIaFOGIGPHLAUWUEeJjJzyTYzsgSNiPqta4g4I6a0cvaZTSguwOwJpqeRAa43IRjYtZHGSeS6rCqD1l-jVk5XuSthYsSaMWrhulS9U9ZUZKgqI5A1VkHglwVs1Mo-bTOG0RNc7HKF5grARA5End3b8eIDxw";

  useEffect(() => {
    const session = OT.initSession(appId, sessionId);

    const publisher = OT.initPublisher(
      "publisher",
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
      },
      handleError
    );

    session.connect(token, function (error) {
      if (error) {
        handleError(error);
      } else {
        session.publish(publisher, handleError);
      }
    });

    session.on("streamCreated", function (event) {
      session.subscribe(
        event.stream,
        "subscriber",
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        handleError
      );
    });

    return () => {
      session.disconnect();
    };
  }, [appId, sessionId, token]);

  return (
    <div className="flex items-center justify-center">
      <div id="subscriber" className="w-40 h-40"></div>
      <div
        id="publisher"
        className="w-40 h-40 border-3 border-white border-solid rounded-md"
      ></div>
    </div>
  );
};

export default VideoContent;
