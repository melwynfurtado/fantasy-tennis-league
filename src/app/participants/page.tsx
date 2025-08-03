"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

export default function ParticipantsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Participant registered!");
      setName("");
      setEmail("");
      mutate(); // Refresh the participants list
    } else {
      setMessage(data.error || "Error registering participant");
    }
  }

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: participants, mutate } = useSWR('/api/participants', fetcher);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this participant?')) return;
    
    try {
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setMessage("Participant deleted successfully!");
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error deleting participant");
      }
    } catch {
      setMessage("Error deleting participant");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <nav className="mb-4 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Register Participant
      </nav>
      <h2 className="text-2xl font-bold mb-4">Register Participant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="btn w-full">Register</button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${
          message.includes('Error') || message.includes('error') 
            ? 'text-red-600' 
            : 'text-green-600'
        }`}>
          {message}
        </p>
      )}
      <hr className="my-6" />
      <h3 className="text-lg font-semibold mb-2">Existing Participants</h3>
      <ul className="space-y-2">
        {participants?.map((p: any) => (
          <li key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.email}</div>
            </div>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() => handleDelete(p.id)}
            >Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
