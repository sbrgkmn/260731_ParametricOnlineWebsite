import { permanentRedirect } from "next/navigation";

export default function ContactRedirect() {
  permanentRedirect("/expert-help#project-inquiry");
}
