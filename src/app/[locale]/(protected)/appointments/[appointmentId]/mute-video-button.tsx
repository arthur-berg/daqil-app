import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  MdMic,
  MdMicOff,
  MdArrowDropDown,
  MdVideocamOff,
  MdVideocam,
} from "react-icons/md";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import useDevices from "@/hooks/use-devices";

export default function MuteVideoButton({
  hasVideo,
  toggleVideo,
  getVideoSource,
  cameraPublishing,
  changeVideoSource,
}: any) {
  const title = hasVideo ? "Disable Camera" : "Enable Camera";
  const { deviceInfo } = useDevices();
  const [devicesAvailable, setDevicesAvailable] = useState<any>(null);
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const user = useCurrentUser();

  useEffect(() => {
    setDevicesAvailable(deviceInfo.videoInputDevices);
    if (cameraPublishing) {
      const currentDeviceId = getVideoSource()?.deviceId;

      const IndexOfSelectedElement = devicesAvailable.indexOf(
        devicesAvailable.find((e: any) => e.deviceId === currentDeviceId)
      );
      setSelectedIndex(IndexOfSelectedElement);
    }
  }, [cameraPublishing, getVideoSource, deviceInfo, devicesAvailable]);

  useEffect(() => {
    if (devicesAvailable) {
      // Check if the user is on a mobile device
      const isMobile = /iPhone|Android|iPad|iPod/.test(navigator.userAgent);

      let videoDevicesAvailable;

      if (isMobile) {
        // Limit to the main two cameras
        videoDevicesAvailable = devicesAvailable
          .slice(0, 2)
          .map((e: any) => e.label);
      } else {
        // Show all video devices on non-mobile
        videoDevicesAvailable = devicesAvailable.map((e: any) => e.label);
      }

      setOptions(videoDevicesAvailable);
    }
  }, [devicesAvailable]);

  const handleChangeVideoSource = (event: any, index: any) => {
    setSelectedIndex(index);
    setOpen(false);
    const videoDeviceId = devicesAvailable.find(
      (device: any) => device.label === event.target.textContent
    ).deviceId;
    changeVideoSource(videoDeviceId);
  };

  const handleToggle = (e: any) => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <>
        <TooltipProvider>
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={toggleVideo}>
                  {!hasVideo ? (
                    <MdVideocamOff
                      fontSize="inherit"
                      className="w-8 h-8 text-white cursor-pointer"
                    />
                  ) : (
                    <MdVideocam
                      fontSize="inherit"
                      className="w-8 h-8 text-white cursor-pointer"
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>{title}</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger onClick={handleToggle}>
                <MdArrowDropDown className="w-8 h-8 text-white cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                {options.map((option, index) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={(event) => handleChangeVideoSource(event, index)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </>
    </>
  );
}
