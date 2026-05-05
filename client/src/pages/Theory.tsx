import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Streamdown } from "streamdown";
import { knowledgeBase } from "@/data/kb";

export default function Theory() {
  const params = useParams();
  const blockId = parseInt(params.blockId || "1");
  
  const block = knowledgeBase.blocks.find(b => b.id === blockId);

  if (!block) {
    return (
      <div className=" min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Блок не найден</h1>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{block.title}</h1>
            <p className="text-slate-600">{block.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Tabs defaultValue={`section-${block.sections[0].id}`} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(block.sections.length, 3)}, 1fr)` }}>
            {block.sections.map((section) => (
              <TabsTrigger key={section.id} value={`section-${section.id}`} className="text-sm">
                {section.title.split(":")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {block.sections.map((section) => (
            <TabsContent key={section.id} value={`section-${section.id}`} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <Streamdown>{section.content}</Streamdown>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {blockId > 1 && (
            <a href={`/theory/${blockId - 1}`} className="text-blue-600 hover:text-blue-700 font-medium">
              ← Предыдущий блок
            </a>
          )}
          {blockId < knowledgeBase.blocks.length && (
            <a href={`/theory/${blockId + 1}`} className="text-blue-600 hover:text-blue-700 font-medium ml-auto">
              Следующий блок →
            </a>
          )}
        </div>
      </div>


    </div>
  );
}
