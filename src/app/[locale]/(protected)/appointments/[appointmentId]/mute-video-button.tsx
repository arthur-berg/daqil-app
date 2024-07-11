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
  const [devicesAvailable, setDevicesAvailable] = useState(null);
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const user = useCurrentUser();

  useEffect(() => {
    setDevicesAvailable(deviceInfo.videoInputDevices);
    if (cameraPublishing) {
      const currentDeviceId = getVideoSource()?.deviceId;

      const IndexOfSelectedElement = devicesAvailable.indexOf(
        devicesAvailable.find((e) => e.deviceId === currentDeviceId)
      );
      setSelectedIndex(IndexOfSelectedElement);
    }
  }, [cameraPublishing, getVideoSource, deviceInfo, devicesAvailable]);

  useEffect(() => {
    if (devicesAvailable) {
      const videoDevicesAvailable = devicesAvailable.map((e) => {
        return e.label;
      });
      setOptions(videoDevicesAvailable);
    }
    // if (user.videoEffects.backgroundBlur)
    //   setOptions(['Not available with Background Blurring']);
  }, [devicesAvailable]);

  const handleChangeVideoSource = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    const videoDeviceId = devicesAvailable.find(
      (device) => device.label === event.target.textContent
    ).deviceId;
    changeVideoSource(videoDeviceId);
  };

  const handleToggle = (e) => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
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
      {/*   <ButtonGroup
        className={classes.groupButton}
        disableElevation
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
      >
        <Tooltip title={title} aria-label="add">
          <IconButton
            onClick={toggleVideo}
            edge="start"
            aria-label="videoCamera"
            size="small"
            className={`${classes.arrowButton} ${
              !hasVideo ? classes.disabledButton : ""
            }`}
          >
            {!hasVideo ? <VideocamOff /> : <VideoCam />}
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          className={classes.arrowButton}
        >
          <ArrowDropDownIcon />
        </IconButton>
      </ButtonGroup>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 101 }} 
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleChangeVideoSource(event, index)}
                      classes={{
                        selected: localClasses.selected,
                        root: localClasses.root,
                      }}
                 
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper> */}
    </>
  );
}
