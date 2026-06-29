interface PetBubbleProps {
  text: string;
  visible: boolean;
}

export default function PetBubble({ text, visible }: PetBubbleProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#f0d5b0",
        border: "2px solid #8b6b4a",
        padding: "6px 10px",
        color: "#2b1b17",
        fontSize: 12,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}
