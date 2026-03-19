"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      await api.submitContact(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {success && (
        <div className="bg-green-50 text-green-800 border border-green-200 rounded-2xl px-4 py-3 text-sm font-medium">
          Thanks for reaching out! I'll get back to you soon.
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-2xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="name" className="text-sm font-medium text-black/80">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30 disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="email" className="text-sm font-medium text-black/80">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30 disabled:opacity-50"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-sm font-medium text-black/80">Subject</label>
        <input 
          type="text" 
          id="subject" 
          name="subject" 
          required 
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30 disabled:opacity-50"
          placeholder="What's this about?"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-black/80">Message</label>
        <textarea 
          id="message" 
          name="message" 
          rows={6}
          required 
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30 resize-none disabled:opacity-50"
          placeholder="Your message here..."
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 mt-2 rounded-full bg-black text-white font-medium text-sm hover:scale-[1.02] transition-transform self-start shadow-sm disabled:opacity-70 disabled:hover:scale-100"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}