"use client";
import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import _ from "lodash";
import { startVideoRecording } from "@/actions/videoSessions/actions";

interface Credentials {
  appId: string;
  sessionId: string;
  token: string;
}

interface VideoFilter {
  filterName: string;
  filterPayload: any;
}

interface PublisherOptions {
  style?: {
    buttonDisplayMode: string;
    nameDisplayMode: string;
    audioLevelDisplayMode: string;
  };
  name?: string;
  showControls?: boolean;
  videoFilter?: any;
}

export default function useRoom() {
  let roomRef = useRef<any>(null);
  const publisherOptionsRef = useRef<PublisherOptions>({});
  const [isPending, startTransition] = useTransition();
  const [camera, setCamera] = useState(null);
  const [screen, setScreen] = useState(null);
  const [localParticipant, setLocalParticipant] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<any>([]);
  const [networkStatus, setNetworkStatus] = useState("");
  const [publisherIsSpeaking, setPublisherIsSpeaking] = useState(false);
  const [cameraPublishing, setCameraPublishing] = useState(false);

  const addParticipants = ({ participant }: any) => {
    setParticipants((prev: any) => [...prev, participant]);
  };

  const removeParticipants = ({ participant }: any) => {
    setParticipants((prev: any) =>
      prev.filter(
        (prevparticipant: any) => prevparticipant.id !== participant.id
      )
    );
  };

  const addLocalParticipant = ({ room }: any) => {
    if (room) {
      setLocalParticipant({
        id: room.participantId as any,
        name: room.participantName,
      });
    }
  };

  const removeLocalParticipant = ({ participant }: any) => {
    setParticipants(null);
  };

  const onAudioLevel = useCallback((audioLevel: any) => {
    let movingAvg = null;
    if (movingAvg === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg = 0.8 * movingAvg + 0.2 * audioLevel;
    }
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const currentLogLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    if (currentLogLevel > 0.4) {
      setPublisherIsSpeaking(true);
    } else {
      setPublisherIsSpeaking(false);
    }
  }, []);

  const addPublisherCameraEvents = () => {
    if (roomRef?.current?.camera) {
      roomRef.current.camera.on(
        "audioLevelUpdated",
        _.throttle((event) => onAudioLevel(event), 250)
      );
    }
  };

  const parseVideoFilter = (videoFilter: any) => {
    switch (videoFilter.filterName) {
      case "blur":
        return {
          type: "backgroundBlur",
          blurStrength: videoFilter.filterPayload,
        };
      case "backgroundImage":
        // previewPublisher.setVideoFilter({ type: "backgroundReplacement", backgroundImgUrl: filterPayload });
        return {
          type: "backgroundReplacement",
          backgroundImgUrl: videoFilter.filterPayload,
        };
      default:
        // do nothing
        return {};
    }
  };

  const startRoomListeners = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.on("connected", () => {
        console.log("Room: connected");
      });
      roomRef.current.on("disconnected", () => {
        setNetworkStatus("disconnected");
        console.log("Room: disconnected");
      });
      roomRef.current.camera.on("created", () => {
        setCameraPublishing(true);
        console.log("camera publishing now");
      });
      roomRef.current.on("activeSpeakerChanged", (participant: any) => {
        console.log("Active speaker changed", participant);
      });

      roomRef.current.on("reconnected", () => {
        setNetworkStatus("reconnected");
        console.log("Room: reconnected");
      });
      roomRef.current.on("reconnecting", () => {
        setNetworkStatus("reconnecting");
        console.log("Room: reconnecting");
      });
      roomRef.current.on("participantJoined", (participant: any) => {
        addParticipants({ participant: participant });
        console.log("Room: participant joined: ", participant);
      });
      roomRef.current.on("participantLeft", (participant: any, reason: any) => {
        removeParticipants({ participant: participant });
        console.log("Room: participant left", participant, reason);
      });
    }
  }, []);

  const startRecording = useCallback(
    async (sessionId: string, appointmentData: any, token: string) => {
      try {
        startTransition(async () => {
          await startVideoRecording(sessionId, appointmentData, token);
        });
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    },
    []
  );

  const createCall = useCallback(
    async (
      { appId, sessionId, token }: Credentials,
      roomContainer: any,
      userName: string,
      appointmentData?: any,
      videoRecordingStarted?: boolean,
      videoFilter?: VideoFilter,
      publisherOptions?: PublisherOptions
    ) => {
      if (!appId || !sessionId || !token) {
        throw new Error("Check your credentials");
      }
      const VideoExpress = await import("@vonage/video-express");

      const selfVideoContainer = document.createElement("div");
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        selfVideoContainer.style.position = "absolute";
        selfVideoContainer.style.bottom = "90px";
        selfVideoContainer.style.right = "0";
        selfVideoContainer.style.width = "133px";
        selfVideoContainer.style.height = "105px";
      } else {
        selfVideoContainer.style.position = "absolute";
        selfVideoContainer.style.bottom = "0";
        selfVideoContainer.style.right = "0";
        selfVideoContainer.style.width = "207px";
        selfVideoContainer.style.height = "168px";
      }

      selfVideoContainer.style.border = "2px solid gray";
      selfVideoContainer.style.zIndex = "100";

      selfVideoContainer.classList.add("self-video-container");

      roomContainer.appendChild(selfVideoContainer);

      roomRef.current = new VideoExpress.Room({
        apiKey: appId,
        sessionId: sessionId,
        token: token,
        roomContainer: "roomContainer",
        maxVideoParticipantsOnScreen: 2,
        participantName: userName,
        managedLayoutOptions: {
          layoutMode: "grid",
          cameraPublisherContainer: selfVideoContainer,
        },
      }) as any;

      const publisherProperties = {
        resolution: "1280x720",
        fitMode: "cover",
        insertMode: "replace",
        width: "100%",
        height: "100%",
        publishAudio: true,
        publishVideo: true,
        insertDefaultUI: true,
      };

      startRoomListeners();

      if (videoFilter && videoFilter.filterName && videoFilter.filterPayload) {
        publisherOptionsRef.current = {
          ...publisherOptions,
          style: {
            buttonDisplayMode: "off",
            nameDisplayMode: "auto",
            audioLevelDisplayMode: "off",
          },
          name: userName,
          showControls: true,
          videoFilter: parseVideoFilter(videoFilter),
        };
      } else {
        publisherOptionsRef.current = {
          ...publisherOptions,
          ...publisherProperties,
          style: {
            buttonDisplayMode: "off",
            nameDisplayMode: "auto",
            audioLevelDisplayMode: "off",
          },
          name: userName,
          showControls: true,
        };
      }

      roomRef.current
        .join({ publisherProperties: publisherOptionsRef.current })
        .then(() => {
          setConnected(true);
          setCamera(roomRef.current!.camera);
          setScreen(roomRef.current!.screen);
          addLocalParticipant({ room: roomRef.current! });
          startRecording(sessionId, appointmentData, token);

          const hideArchivingIndicator = () => {
            const archivingElement = document.querySelector(
              ".OT_archiving"
            ) as any;
            if (archivingElement) {
              archivingElement.style.display = "none";
            }
          };

          hideArchivingIndicator();

          /*   const observer = new MutationObserver(() => hideArchivingIndicator());
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          }); */
        })
        .catch((error: any) => console.log(error));
    },
    [startRoomListeners]
  );

  return {
    createCall,
    connected,
    camera: camera,
    screen: screen,
    room: roomRef.current,
    participants,
    networkStatus,
    publisherIsSpeaking,
    cameraPublishing,
    localParticipant,
  };
}
