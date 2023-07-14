import React, { Dispatch, FormEvent, SetStateAction } from "react";

type ChatInputFooterProps = {
  submitQuestion: (event: FormEvent) => void;
  awaitingResponse: boolean,
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

export default function ChatInputFooter(props: ChatInputFooterProps) {
  const { submitQuestion, awaitingResponse, query, setQuery } = props;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-200">
      <form
        className="max-w-screen-lg m-auto w-full p-4 flex space-x-4 justify-center items-center"
        onSubmit={submitQuestion}
      >
        <input
          id="message"
          type="text"
          autoComplete="off"
          disabled={awaitingResponse}
          className="border rounded-md p-2 flex-1 border-gray-300"
          placeholder="Which entity is driving my sales growth in 2022 compared to 2021?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={awaitingResponse}
          className={`${awaitingResponse ? 'bg-gray-800' : 'bg-green-700'} text-white px-4 py-2 rounded-md`}>
          Submit
        </button>
      </form>
    </div>
  );
}
