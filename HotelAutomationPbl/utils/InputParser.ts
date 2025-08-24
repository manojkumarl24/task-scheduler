export type ParsedCommand =
  | { kind: "MOTION"; floorId: string; subCorridorId: string }
  | { kind: "QUIT" }
  | { kind: "UNKNOWN"; message: string };

function safeSplit(s: string, sep: string, expectedParts: number): string[] | null {
  if (typeof s !== "string") return null;
  const parts = s.split(sep).map(p => p.trim());
  if (parts.length !== expectedParts || parts.some(p => p.length === 0)) return null;
  return parts;
}

export function parseCommand(raw: unknown): ParsedCommand {
  if (typeof raw !== "string") {
    return { kind: "UNKNOWN", message: "Input not a string" };
  }

  const input = raw.trim();
  if (input.toLowerCase() === "quit") return { kind: "QUIT" };

  const arrow = safeSplit(input, "=>", 2);
  if (!arrow) return { kind: "UNKNOWN", message: "Invalid format. Use MOTION=>floor|sub" };

  const verb = arrow[0];
  const payload = arrow[1];

  if (verb.toUpperCase() !== "MOTION") {
    return { kind: "UNKNOWN", message: `Unsupported command: ${verb ?? "(none)"}` };
  }

  const ids = safeSplit(payload, "|", 2);
  if (!ids) return { kind: "UNKNOWN", message: "Invalid MOTION payload. Use FLOOR|SUB" };

  return { kind: "MOTION", floorId: ids[0], subCorridorId: ids[1] };
}

export function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt((raw ?? "").trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
