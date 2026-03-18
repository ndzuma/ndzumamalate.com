import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me.",
};

export default function ContactPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          contact
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          Have a project in mind, or just want to say hi? Fill out the form below or email me directly at <a href="mailto:ndzumaxx@gmail.com" className="text-black font-medium hover:underline decoration-black/30 underline-offset-4 cursor-pointer">ndzumaxx@gmail.com</a>.
        </p>
      </section>

      <div className="max-w-xl">
        <form className="flex flex-col gap-6" action="mailto:ndzumaxx@gmail.com" method="POST" encType="text/plain">
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="name" className="text-sm font-medium text-black/80">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30"
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
                className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30"
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
              className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30"
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
              className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/5 focus:border-black/20 focus:bg-transparent outline-none transition-all text-black placeholder:text-black/30 resize-none"
              placeholder="Your message here..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3.5 mt-2 rounded-full bg-black text-white font-medium text-sm hover:scale-[1.02] transition-transform self-start shadow-sm"
          >
            Send message
          </button>
        </form>
      </div>
    </main>
  );
}
