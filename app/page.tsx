"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useEffect, useState } from "react";

export default function Index() {
  const [model, setModel] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState({});

  useEffect(() => {
    fetch('/api/model')
      .then((res) => res.json())
      .then((resp) => {
        setModel(resp);
      });
  }, [setModel]);

  const submitQuestion = async (event: FormEvent) => {
    event.preventDefault();
    fetch("/api/query", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((res) => res.json())
    .then((res) => setResponse(res[0]));
  };

  return (
    <div>
      <h1>Loaded Model:</h1>
      <ul className="my-auto">
        {model?.map((m) => (
          // <li key={e.id}>{e.name}</li>
          <li>{JSON.stringify(m)}</li>
        ))}
      </ul>

      <br/>

      <form onSubmit={submitQuestion}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>Submit</button>
      </form>
      
      <span>Response: {JSON.stringify(response)}</span>
    </div>
  );
}
