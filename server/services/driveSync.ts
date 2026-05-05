import { invokeLLM } from "../_core/llm";

export interface ContentElement {
  id: string;
  block: "finance" | "inventory" | "sourcing" | "digital" | "risk" | "interview" | "calc" | "negotiation" | "category";
  type: "theory" | "formula" | "case" | "metric" | "tool" | "interview" | "calc";
  title: string;
  content: string;
  source: string;
  tags: string[];
  difficulty: "basic" | "advanced" | "expert";
}

export interface SyncResult {
  fileName: string;
  itemsFound: ContentElement[];
  duplicates: string[];
  newItems: ContentElement[];
}

/**
 * Parse content from file and extract structured knowledge elements
 */
export async function parseAndClassifyContent(
  fileName: string,
  fileContent: string
): Promise<ContentElement[]> {
  try {
    const prompt = `
You are a CPO (Chief Procurement Officer) knowledge expert. Analyze the provided content and extract structured knowledge elements.

File: ${fileName}
Content:
${fileContent}

Extract ALL meaningful elements and classify them. For each element, provide:
1. A clear title
2. The content/description
3. Type: theory, formula, case, metric, tool, interview, or calc
4. Block assignment: finance, inventory, sourcing, digital, risk, interview, calc, negotiation, or category
5. Relevant tags (3-5 tags)
6. Difficulty level: basic, advanced, or expert

Rules:
- If it's a case study → type=case, block=interview
- If it's a formula → type=formula, block=finance or calc
- If it's a KPI/metric → type=metric, block=finance or risk
- If it's a tool/approach → type=tool, block=sourcing or digital
- If it's interview Q&A → type=interview, block=interview
- Split complex items into atomic elements

Return as JSON array with this structure:
[
  {
    "title": "string",
    "content": "string (markdown format)",
    "type": "theory|formula|case|metric|tool|interview|calc",
    "block": "finance|inventory|sourcing|digital|risk|interview|calc|negotiation|category",
    "tags": ["tag1", "tag2", "tag3"],
    "difficulty": "basic|advanced|expert"
  }
]

Return ONLY valid JSON, no other text.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a CPO knowledge extraction expert. Extract and classify procurement knowledge from documents. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message.content;
    if (!messageContent || typeof messageContent !== "string") {
      console.warn(`[DriveSync] Invalid response for ${fileName}`);
      return [];
    }
    
    // Extract JSON from response
    const jsonMatch = messageContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn(`[DriveSync] No JSON found in response for ${fileName}`);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]) as any[];
    
    // Transform to ContentElement format with IDs
    return parsed.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      block: item.block || "finance",
      type: item.type || "theory",
      title: item.title || "Untitled",
      content: item.content || "",
      source: fileName,
      tags: item.tags || [],
      difficulty: item.difficulty || "basic",
    }));
  } catch (error) {
    console.error(`[DriveSync] Error parsing ${fileName}:`, error);
    return [];
  }
}

/**
 * Check for duplicate or similar items in existing knowledge base
 */
export function findDuplicates(
  newItems: ContentElement[],
  existingItems: ContentElement[]
): { duplicates: string[]; unique: ContentElement[] } {
  const duplicates: string[] = [];
  const unique: ContentElement[] = [];

  for (const newItem of newItems) {
    const isDuplicate = existingItems.some((existing) => {
      // Check for exact or very similar titles
      const titleSimilarity = calculateSimilarity(newItem.title, existing.title);
      // Check for same block and type
      const sameCategoryAndType = newItem.block === existing.block && newItem.type === existing.type;
      
      return titleSimilarity > 0.6 && sameCategoryAndType;
    });

    if (isDuplicate) {
      duplicates.push(newItem.title);
    } else {
      unique.push(newItem);
    }
  }

  return { duplicates, unique };
}

/**
 * Simple string similarity calculation (Levenshtein distance)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1] || 0;
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j] || 0) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length] || 0;
}

/**
 * Extract text from different file types
 */
export async function extractTextFromFile(
  fileName: string,
  fileBuffer: Buffer
): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "txt") {
    return fileBuffer.toString("utf-8");
  }

  if (ext === "pdf") {
    // For PDF, we would need pdfparse or similar
    // For now, return placeholder
    return `[PDF Content from ${fileName} - requires PDF parser]`;
  }

  if (ext === "doc" || ext === "docx") {
    // For DOC/DOCX, we would need docx parser
    // For now, return placeholder
    return `[DOC Content from ${fileName} - requires DOC parser]`;
  }

  return "";
}
