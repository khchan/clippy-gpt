import { ChatMessage } from "@/app/types";
import React from "react";
import Message from "./Message";

type MessageListProps = {
    messages: ChatMessage[]
}

export default function MessageList(props: MessageListProps) {
    const {messages} = props;
    return <div className="bg-inherit max-w-4xl mx-auto space-y-12 grid grid-cols-1">
        {messages.map((message, idx) => <Message key={idx} message={message} />)}
    </div>
}