"use client";
import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import _ from "lodash";
import { markBothUserAsShowedUp } from "@/actions/videoSessions/markBothUserAsShowedUp";

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
  const [camera, setCamera] = useState(null);
  const [screen, setScreen] = useState(null);
  const [localParticipant, setLocalParticipant] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<any>([]);
  const [networkStatus, setNetworkStatus] = useState("");
  const [publisherIsSpeaking, setPublisherIsSpeaking] = useState(false);
  const [cameraPublishing, setCameraPublishing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const addParticipants = ({ participant, appointmentId }: any) => {
    startTransition(async () => {
      try {
        await markBothUserAsShowedUp(appointmentId);
      } catch (error) {
        console.error("Error marking user as showed up:", error);
      }
    });
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

  const startRoomListeners = useCallback((appointmentId: string) => {
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
        addParticipants({
          participant: participant,
          appointmentId: appointmentId,
        });

        console.log("Room: participant joined: ", participant);
      });
      roomRef.current.on("participantLeft", (participant: any, reason: any) => {
        removeParticipants({ participant: participant });
        console.log("Room: participant left", participant, reason);
      });
    }
  }, []);

  const createCall = useCallback(
    async (
      { appId, sessionId, token }: Credentials,
      roomContainer: any,
      userName: string,
      appointmentId: string,
      videoFilter?: VideoFilter,
      publisherOptions?: PublisherOptions
    ) => {
      if (!appId || !sessionId || !token) {
        throw new Error("Check your credentials");
      }
      const VideoExpress = await import("@vonage/video-express");

      // Create a self-video container inside the roomContainer
      const selfVideoContainer = document.createElement("div");
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile view adjustments: smaller video and centered within the roomContainer
        selfVideoContainer.style.position = "absolute"; // Change to absolute for positioning relative to roomContainer
        selfVideoContainer.style.bottom = "90px";
        selfVideoContainer.style.right = "0";
        selfVideoContainer.style.width = "133px"; // Smaller size for mobile
        selfVideoContainer.style.height = "105px";
      } else {
        // Desktop view adjustments: bottom-right corner within the roomContainer
        selfVideoContainer.style.position = "absolute"; // Change to absolute for positioning relative to roomContainer
        selfVideoContainer.style.bottom = "0";
        selfVideoContainer.style.right = "0";
        selfVideoContainer.style.width = "207px"; // Adjust size for desktop
        selfVideoContainer.style.height = "168px";
      }

      selfVideoContainer.style.border = "2px solid gray";
      selfVideoContainer.style.zIndex = "100";

      selfVideoContainer.classList.add("self-video-container");

      // Append the selfVideoContainer to the roomContainer
      roomContainer.appendChild(selfVideoContainer);

      roomRef.current = new VideoExpress.Room({
        apiKey: appId,
        sessionId: sessionId,
        token: token,
        roomContainer: "roomContainer", // This is the parent container
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

      startRoomListeners(appointmentId);

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
