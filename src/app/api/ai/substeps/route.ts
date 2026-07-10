import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const prompt = `You are a senior software project manager. Given the following sprint task title, generate exactly 5 concise, actionable sub-steps that a developer should complete to finish this task. Return ONLY a JSON array of 5 short strings (no markdown, no explanation). Each sub-step should be under 12 words.

Task title: "${title}"

Example output format:
["Sub-step one here", "Sub-step two here", "Sub-step three here", "Sub-step four here", "Sub-step five here"]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[AI substeps] Gemini API error:', errBody);
      return NextResponse.json({ error: 'AI service returned an error.' }, { status: 502 });
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON array from the response (handle markdown code fences if present)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned an unexpected format.' }, { status: 502 });
    }

    const substeps: string[] = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(substeps) || substeps.length === 0) {
      return NextResponse.json({ error: 'AI returned an empty list.' }, { status: 502 });
    }

    return NextResponse.json({ substeps });
  } catch (err) {
    console.error('[AI substeps] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
