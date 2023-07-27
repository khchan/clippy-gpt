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
        setMessages([...messages, {textContent: message, role: Role.System}]);
        setAwaitingResponse(false);
      });
  }, []);

  const getRollups = async function(query: String) {
    // TODO: call new rollups endpoint
    return fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      })
    .then((res) => res.json())
    .then((res) => res);
  }

  const getCompletion = async function(rollupPath: String) {
    return fetch("/api/completion", {
      method: "POST",
      body: JSON.stringify({ rollupPath }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
    .then((res) => res.json())
    .then((res) => {
      setMessages(messages => ([...messages, {textContent: res.completion, role: Role.System}]));
    });
  }

  const getGraph = async function(rollupPath: String) {
    // TODO: replace this with call to vercel python endpoint
    return fetch("/api/graph", {
      method: "POST",
      body: JSON.stringify({ rollupPath }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
    .then((res) => res.json())
    .then((res) => {
      setMessages(messages => ([...messages, {imageContentURI: res.graphUrl, role: Role.System}]));
    });
  }

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    // add user message
    setMessages(messages => ([...messages, {textContent: query, role: Role.User}]));
    setAwaitingResponse(true);
    
    getRollups(query)
      .then((rollupPath) => {
        return Promise.all([
          getCompletion(rollupPath),
          getGraph(rollupPath),
        ]);
      })
      .then(() => {
        setQuery("");
        setAwaitingResponse(false);
      })
      .catch((err) => {
        console.error(err);
        setMessages(messages => ([...messages, {textContent: "An error occurred, please try again later!", role: Role.System}]));
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
