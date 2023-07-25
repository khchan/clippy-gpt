import { ChatMessage, Role } from "@/app/types";
import React from "react";

type MessageProps = {
  message: ChatMessage;
};

export default function Message(props: MessageProps) {
  const { message } = props;
  const isUserMessage = message.role === Role.User;
  const messageClassName = isUserMessage ?
    "bg-green-50 text-green-900 p-5 rounded-2xl rounded-tr-none" :
    "bg-white p-5 rounded-2xl rounded-tl-none";

  return (
    <div
      className={`${
        isUserMessage ? "place-self-end text-right" : "place-self-start text-left"
      } space-y-2 whitespace-pre-line`}
    >
      <div className={messageClassName}>
        {message.content}
      </div>
    </div>
  );
}
