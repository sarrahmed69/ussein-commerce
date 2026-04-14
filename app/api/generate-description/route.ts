import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nom, imageBase64, imageType } = await req.json();
    if (!nom) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    const messages: any[] = [];
    if (imageBase64 && imageType) {
      messages.push({ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: imageType, data: imageBase64 } },
        { type: "text", text: "Redige une description commerciale courte (max 200 mots) en francais pour ce produit vendu sur un campus universitaire au Senegal. Nom : " + nom + ". Sois concis et attractif pour les etudiants." }
      ]});
    } else {
      messages.push({ role: "user", content: "Redige une description commerciale courte (max 200 mots) en francais pour ce produit vendu sur un campus universitaire au Senegal. Nom : " + nom + ". Sois concis et attractif pour les etudiants." });
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, messages }),
    });
    const data = await response.json();
    const description = data.content?.[0]?.text ?? "";
    return NextResponse.json({ description });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
