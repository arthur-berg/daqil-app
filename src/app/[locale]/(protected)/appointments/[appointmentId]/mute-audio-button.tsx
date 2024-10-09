import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdMic, MdMicOff, MdArrowDropDown } from "react-icons/md";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import useDevices from "@/hooks/use-devices";

export default function MuteAudioButton({
  toggleAudio,
  hasAudio,
  getAudioSource,
  cameraPublishing,
  changeAudioSource,
}: any) {
  const title = hasAudio ? "Disable Microphone" : "Enable Microphone";
  const { deviceInfo } = useDevices();
  const [devicesAvailable, setDevicesAvailable] = useState<any>(null);
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [audioDeviceId, setAudioDeviceId] = useState("");

  useEffect(() => {
    setDevicesAvailable(deviceInfo.audioInputDevices);

    if (cameraPublishing && devicesAvailable) {
      getAudioSource().then((id: any) => setAudioDeviceId(id));

      const indexOfSelectedElement = devicesAvailable.indexOf(
        devicesAvailable.find((e: any) => e.deviceId === audioDeviceId)
      );

      setSelectedIndex(indexOfSelectedElement);
    }
  }, [
    cameraPublishing,
    getAudioSource,
    deviceInfo,
    audioDeviceId,
    devicesAvailable,
  ]);

  useEffect(() => {
    if (devicesAvailable) {
      const audioDevicesAvailable = devicesAvailable.map((e: any) => {
        return e.label;
      });
      setOptions(audioDevicesAvailable);
    }
  }, [devicesAvailable]);

  const handleChangeAudioSource = (event: any, index: any) => {
    setSelectedIndex(index);
    setOpen(false);
    const audioDeviceId = devicesAvailable.find(
      (device: any) => device.label === event.target.textContent
    ).deviceId;
    changeAudioSource(audioDeviceId);
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
      <TooltipProvider>
        <div className="flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={toggleAudio}>
                {!hasAudio ? (
                  <MdMicOff
                    fontSize="inherit"
                    className="w-8 h-8 text-red-500 cursor-pointer"
                  />
                ) : (
                  <MdMic
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
                  onClick={(event) => handleChangeAudioSource(event, index)}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </>
  );
}
