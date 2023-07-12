"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FormEvent, useEffect, useState } from "react";

export default function Index() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState({});

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((resp) => {
        setEmployees(resp);
      });
  }, [setEmployees]);

  const submitQuestion = async (event: FormEvent) => {
    event.preventDefault();
    fetch("/api/functions/extract-dimensionality", {
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
      <h1>Hello Employees!</h1>
      <ul className="my-auto">
        {employees?.map((e) => (
          <li key={e.id}>{e.name}</li>
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
