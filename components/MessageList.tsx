import { ChatMessage, Role } from "@/app/types";
import React from "react";
import Message from "./Message";

type MessageListProps = {
    messages: ChatMessage[],
    awaitingResponse: boolean
}

export default function MessageList(props: MessageListProps) {
    const {messages, awaitingResponse} = props;
    return <div className="bg-inherit max-w-4xl mx-auto space-y-12 grid grid-cols-1">
        {messages.map((message, idx) => <Message key={idx} message={message} />)}
        {awaitingResponse && <Message message={{textContent: "...", role: Role.System}} />}
    </div>
}