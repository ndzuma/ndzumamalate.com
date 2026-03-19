import type { Metadata } from "next";
import ContactForm from "../../components/contact-form";

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
        <ContactForm />
      </div>
    </main>
  );
}
