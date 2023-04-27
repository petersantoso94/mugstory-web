import React, { useEffect, useState } from "react";
export enum ToastType {
  INFO = "Info",
  SUCCESS = "Success",
  WARNING = "Warning",
  ERROR = "Error",
}
export enum ToastJustify {
  RIGHT = "right",
  LEFT = "left",
  CENTER = "center",
}
type IProp = {
  titleText?: string;
  timeText?: string;
  justify?: ToastJustify;
  content: string;
  type: ToastType;
  hideToastHandler: () => void;
  showForSecond?: number;
};
export default function Toaster(props: IProp) {
  const {
    content,
    type,
    timeText,
    titleText,
    justify,
    showForSecond,
    hideToastHandler,
  } = props;
  let bgcolor = "";
  let bordercolor = "";
  let icon = <></>;
  switch (type) {
    case ToastType.ERROR:
      bgcolor = "bg-red-500";
      bordercolor = "border-red-300";
      icon = (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="times-circle"
          className="w-4 h-4 mr-2 fill-current"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
          ></path>
        </svg>
      );
      break;
    case ToastType.SUCCESS:
      bgcolor = "bg-teal-500";
      bordercolor = "border-teal-300";
      icon = (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="check-circle"
          className="w-4 h-4 mr-2 fill-current"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"
          ></path>
        </svg>
      );
      break;
    case ToastType.INFO:
      bgcolor = "bg-blue-500";
      bordercolor = "border-blue-300";
      icon = (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="info-circle"
          className="w-4 h-4 mr-2 fill-current"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
          ></path>
        </svg>
      );
    case ToastType.WARNING:
      bgcolor = "bg-yellow-500";
      bordercolor = "border-yellow-300";
      icon = (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="exclamation-triangle"
          className="w-4 h-4 mr-2 fill-current"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            fill="currentColor"
            d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
          ></path>
        </svg>
      );
    default:
      break;
  }
  showForSecond &&
    setTimeout(() => {
      hideToastHandler();
    }, showForSecond * 1000);

  const justifyConst = justify || "end";
  return (
    <div className={`absolute w-screen p-5 grid justify-items-${justifyConst}`}>
      <div
        className={`${bgcolor} shadow-lg md:w-96 max-w-full w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block mb-3`}
      >
        <div
          className={`${bgcolor} ${bordercolor} flex justify-between items-center py-2 px-3 bg-clip-padding border-b rounded-t-lg`}
        >
          <p className="font-bold text-white flex items-center">
            {icon}
            {titleText}
          </p>
          <div className="flex items-center">
            <p className="text-white opacity-90 text-xs">{timeText}</p>
            <strong
              className="text-xl text-white align-center cursor-pointer alert-del"
              onClick={hideToastHandler}
            >
              &times;
            </strong>
          </div>
        </div>
        <div className={`p-3 ${bgcolor} rounded-b-lg break-words text-white`}>
          <p className="line-clamp-3">{content}</p>
        </div>
      </div>
    </div>
  );
}
