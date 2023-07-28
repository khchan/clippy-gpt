"use client";

import { FormEvent, useEffect, useState } from "react";
import Banner from "@/components/Banner";
import ChatInputFooter from "@/components/ChatInputFooter";
import { ChatMessage, ModelSummary, Role } from "./types";
import MessageList from "@/components/MessageList";

export default function Index() {
  const [query, setQuery] = useState<string>("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetch("/api/model")
      .then((res) => res.json())
      .then((model: ModelSummary[]) => {
        const message = `Here's some stats about the loaded model:\n${model.map(m => {
          return `${m.table} (${m.count})`;
        }).join(", ")}`
        setMessages([...messages, {content: message, role: Role.System}]);
        setAwaitingResponse(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/python/visualize").then((res) => res.json()).then(console.log);
  }, []);

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    // add user message
    const updatedMessages = [...messages, {content: query, role: Role.User}]
    setMessages(updatedMessages);
    setAwaitingResponse(true);
    //TODO UPDATED HERE
    fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((res) => {
          return Promise.all([
              fetch("/api/prompt", {
                  method: "POST",
                  body: JSON.stringify({ query }),
                  headers: {
                      "Content-type": "application/json; charset=UTF-8",
                  },
              }).then((res) => res.json())
                  .then((res) => {
                      return {content: res, role: Role.System};
                  }),
              fetch("/api/python/visualize", {
                  method: "POST",
                  body: JSON.stringify({ query }),
                  headers: {
                      "Content-type": "application/json; charset=UTF-8",
                  },
              }).then((res) => res.json())
                  .then((res) => {
                      return {content: res, role: Role.System};
                  })]
          )
      }).then((res) => {
        //array of updated
        setMessages([...updatedMessages, ...res]);
        setQuery("");
        setAwaitingResponse(false);
    })
      .catch((err) => {
        console.error(err);
        setMessages(messages => ([...messages, {content: "An error occurred, please try again later!", role: Role.System}]));
        setAwaitingResponse(false);
      });
  };

  return (
    <div className="w-screen h-full bg-gray-50 flex flex-col">
      <Banner />

      <div className="min-h-screen bg-gray-100 p-8 pb-24">
          <MessageList messages={messages} awaitingResponse={awaitingResponse} />
      </div>

      <ChatInputFooter
        submitQuestion={submitQuestion}
        awaitingResponse={awaitingResponse}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
}
