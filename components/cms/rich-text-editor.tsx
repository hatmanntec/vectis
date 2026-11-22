"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A simple word-processor style editor for long text. It saves structured
 * JSON into a hidden field called `name`; the server cleans it before saving.
 * Only headings, bold, italic, underline, lists, quotes and links are offered.
 */
export function RichTextEditor({
  name,
  label,
  hint,
  error,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  defaultValue?: unknown;
}) {
  const [json, setJson] = useState(defaultValue ? JSON.stringify(defaultValue) : "");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
        },
      }),
    ],
    content: (defaultValue as object) ?? "",
    editorProps: {
      attributes: {
        class: "rich-text min-h-48 px-4 py-3 text-sm leading-relaxed outline-none",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => setJson(editor.isEmpty ? "" : JSON.stringify(editor.getJSON())),
  });

  return (
    <div className="space-y-2">
      <p className="text-sm leading-none font-medium">{label}</p>
      <input type="hidden" name={name} value={json} />
      <div
        className={cn(
          "border bg-white focus-within:ring-[3px] focus-within:ring-ring/50",
          error ? "border-destructive" : "border-input",
        )}
      >
        {editor ? <Toolbar editor={editor} /> : <div className="h-10 border-b border-border" />}
        <EditorContent editor={editor} />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://… or mailto:…)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const buttons: { label: string; icon: typeof Bold; active?: boolean; disabled?: boolean; run: () => void }[] = [
    { label: "Heading", icon: Heading2, active: state.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Sub-heading", icon: Heading3, active: state.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bold", icon: Bold, active: state.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: state.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Bulleted list", icon: List, active: state.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: state.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: Quote, active: state.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Link selected text", icon: Link2, active: state.link, run: setLink },
    { label: "Remove link from text", icon: Unlink, disabled: !state.link, run: () => editor.chain().focus().unsetLink().run() },
    { label: "Undo", icon: Undo2, disabled: !state.canUndo, run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: Redo2, disabled: !state.canRedo, run: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap gap-0.5 border-b border-border bg-ivory/40 px-2 py-1">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          aria-label={b.label}
          aria-pressed={b.active ?? undefined}
          disabled={b.disabled}
          // Keep the cursor in the text while a toolbar button is pressed,
          // so typing continues exactly where it was.
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.run}
          className={cn(
            "inline-flex size-8 items-center justify-center text-graphite hover:bg-white disabled:opacity-35",
            b.active && "bg-white text-indigo ring-1 ring-border",
          )}
        >
          <b.icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
