/**
 * The fields each website page offers in the CMS. The page's text is saved
 * in pages.content as { fieldKey: value }. Only the fields listed here are
 * accepted, so the website can rely on them. Every field starts empty:
 * nothing here is content, only labels and limits.
 *
 * Field kinds:
 *   text      one line              textarea  a short paragraph
 *   richtext  formatted text        image     a picture from the library
 *   items     a repeatable list of { heading, text } (e.g. values, principles)
 */

export type Field =
  | { key: string; kind: "text"; label: string; max: number; hint?: string }
  | { key: string; kind: "textarea"; label: string; max: number; hint?: string }
  | { key: string; kind: "richtext"; label: string; hint?: string }
  | { key: string; kind: "image"; label: string; hint?: string }
  | {
      key: string;
      kind: "items";
      label: string;
      itemLabel: string;
      headingLabel: string;
      textLabel: string;
      maxItems: number;
      hint?: string;
    };

export type Section = { title: string; description?: string; fields: Field[] };
export type Template = { label: string; description: string; sections: Section[] };

const intro: Field = { key: "intro", kind: "textarea", label: "Introduction", max: 600, hint: "The opening paragraph under the page heading." };
const body: Field = { key: "body", kind: "richtext", label: "Main text" };
const image: Field = { key: "image", kind: "image", label: "Page image", hint: "Shown at the top of the page." };

export const TEMPLATES: Record<string, Template> = {
  home: {
    label: "Home page",
    description: "The first page visitors see.",
    sections: [
      {
        title: "Opening banner",
        fields: [
          { key: "hero_heading", kind: "text", label: "Main heading", max: 120 },
          { key: "hero_subheading", kind: "textarea", label: "Supporting line", max: 300 },
          { key: "hero_image", kind: "image", label: "Banner image", hint: "A wide, high-quality photograph." },
        ],
      },
      {
        title: "Introduction",
        fields: [
          { key: "intro_heading", kind: "text", label: "Heading", max: 120 },
          { key: "intro_text", kind: "richtext", label: "Text" },
        ],
      },
      {
        title: "Highlights",
        description: "Short points shown as a row of cards, e.g. what VECTIS stands for.",
        fields: [
          {
            key: "highlights",
            kind: "items",
            label: "Highlights",
            itemLabel: "highlight",
            headingLabel: "Heading",
            textLabel: "Text",
            maxItems: 6,
          },
        ],
      },
      {
        title: "Closing invitation",
        fields: [
          { key: "cta_heading", kind: "text", label: "Heading", max: 120 },
          { key: "cta_text", kind: "textarea", label: "Text", max: 400 },
        ],
      },
    ],
  },
  about: {
    label: "About VECTIS",
    description: "Who VECTIS is.",
    sections: [
      { title: "Content", fields: [intro, body, image] },
      {
        title: "Values",
        fields: [
          { key: "values", kind: "items", label: "Values", itemLabel: "value", headingLabel: "Value", textLabel: "Explanation", maxItems: 8 },
        ],
      },
    ],
  },
  history: {
    label: "Corporate History",
    description: "VECTIS's story since 1956.",
    sections: [
      { title: "Content", fields: [intro, body, image] },
      {
        title: "Key dates",
        description: "Only dates confirmed by VECTIS.",
        fields: [
          {
            key: "timeline",
            kind: "items",
            label: "Key dates",
            itemLabel: "date",
            headingLabel: "Year or date",
            textLabel: "What happened",
            maxItems: 30,
          },
        ],
      },
    ],
  },
  businesses: {
    label: "Our Businesses",
    description: "The businesses themselves are listed automatically from Companies.",
    sections: [{ title: "Content", fields: [intro, body] }],
  },
  "investment-philosophy": {
    label: "Investment Philosophy",
    description: "How VECTIS approaches investment.",
    sections: [
      { title: "Content", fields: [intro, body, image] },
      {
        title: "Principles",
        fields: [
          { key: "principles", kind: "items", label: "Principles", itemLabel: "principle", headingLabel: "Principle", textLabel: "Explanation", maxItems: 8 },
        ],
      },
    ],
  },
  governance: {
    label: "Governance",
    description: "How VECTIS is governed.",
    sections: [
      { title: "Content", fields: [intro, body, image] },
      {
        title: "Accountability loop",
        fields: [
          {
            key: "loop",
            kind: "items",
            label: "Stages of the loop, in order",
            itemLabel: "stage",
            headingLabel: "Stage",
            textLabel: "What happens here (optional)",
            maxItems: 8,
          },
        ],
      },
    ],
  },
  leadership: {
    label: "Leadership",
    description: "The people themselves are listed automatically from Leadership.",
    sections: [{ title: "Content", fields: [intro] }],
  },
  contact: {
    label: "Contact",
    description: "The enquiry form is added automatically. Email, phone and address come from Settings.",
    sections: [
      {
        title: "Content",
        fields: [
          intro,
          { key: "office_hours", kind: "textarea", label: "Office hours (optional)", max: 300 },
          {
            key: "form_success_message",
            kind: "textarea",
            label: "Message shown after sending the form",
            max: 300,
            hint: "Leave empty for a standard thank-you message.",
          },
        ],
      },
    ],
  },
  standard: {
    label: "Standard page",
    description: "A general page with text and an image.",
    sections: [{ title: "Content", fields: [intro, body, image] }],
  },
};

export const templateFor = (key: string): Template => TEMPLATES[key] ?? TEMPLATES.standard;

export const allFields = (t: Template) => t.sections.flatMap((s) => s.fields);
