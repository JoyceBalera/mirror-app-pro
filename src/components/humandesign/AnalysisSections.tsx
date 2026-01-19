import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Check, BookOpen, Sparkles, Target } from "lucide-react";
import { 
  TYPE_DESCRIPTIONS, 
  AUTHORITY_DESCRIPTIONS, 
  PROFILE_DESCRIPTIONS,
  DEFINITION_DESCRIPTIONS 
} from "@/data/humanDesignDescriptions";

interface AnalysisSectionsProps {
  energyType: string;
  authority: string;
  profile: string;
  definition: string;
  strategy: string;
}

const AnalysisSections = ({ 
  energyType, 
  authority, 
  profile, 
  definition,
  strategy 
}: AnalysisSectionsProps) => {
  const [readSections, setReadSections] = useState<string[]>([]);

  const typeInfo = TYPE_DESCRIPTIONS[energyType];
  const authorityInfo = AUTHORITY_DESCRIPTIONS[authority] || AUTHORITY_DESCRIPTIONS['Emocional'];
  const profileInfo = PROFILE_DESCRIPTIONS[profile];
  const definitionInfo = DEFINITION_DESCRIPTIONS[definition] || DEFINITION_DESCRIPTIONS['Single'];

  const markAsRead = (sectionId: string) => {
    if (!readSections.includes(sectionId)) {
      setReadSections([...readSections, sectionId]);
    }
  };

  const isRead = (sectionId: string) => readSections.includes(sectionId);

  const totalSections = 6;
  const progress = Math.round((readSections.length / totalSections) * 100);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 border-2 border-[#BFAFB2]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#7B192B]">Progresso de Leitura</span>
          <span className="text-sm text-muted-foreground">{readSections.length}/{totalSections} seções</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#7B192B] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="foundational" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#BFAFB2]/20">
          <TabsTrigger 
            value="foundational" 
            className="data-[state=active]:bg-[#7B192B] data-[state=active]:text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Fundamentos
          </TabsTrigger>
          <TabsTrigger 
            value="advanced"
            className="data-[state=active]:bg-[#7B192B] data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
          <TabsTrigger 
            value="success"
            className="data-[state=active]:bg-[#7B192B] data-[state=active]:text-white"
          >
            <Target className="w-4 h-4 mr-2" />
            Sucesso
          </TabsTrigger>
        </TabsList>

        {/* Fundamentos */}
        <TabsContent value="foundational" className="mt-4">
          <Accordion type="multiple" className="space-y-2">
            {/* Introdução */}
            <AccordionItem value="intro" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('intro')}
              >
                <div className="flex items-center gap-2">
                  {isRead('intro') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Introdução ao Seu Design</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    A Arquitetura Pessoal é um sistema que combina astrologia, I Ching, Kabbalah, e o sistema de chakras para revelar 
                    sua natureza energética única. Seu mapa mostra como você foi desenhada para interagir com o mundo.
                  </p>
                  {typeInfo && (
                    <div className="bg-[#F7F3EF] p-4 rounded-lg">
                      <p className="font-medium text-[#7B192B] mb-2">Sobre Você</p>
                      <p>{typeInfo.summary}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tipo e Estratégia */}
            <AccordionItem value="type" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('type')}
              >
                <div className="flex items-center gap-2">
                  {isRead('type') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Tipo & Estratégia</span>
                  <Badge variant="secondary" className="ml-2">{energyType}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {typeInfo && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">Sua Estratégia: {typeInfo.strategy}</h4>
                      <p className="text-muted-foreground">{typeInfo.strategyDescription}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">Tema do Não-Eu: {typeInfo.notSelfTheme}</h4>
                      <p className="text-muted-foreground">
                        Quando você não está vivendo sua estratégia, tende a experimentar {typeInfo.notSelfTheme.toLowerCase()}. 
                        Este é um sinal de que algo está desalinhado.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">Seus Pontos Fortes</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {typeInfo.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Autoridade */}
            <AccordionItem value="authority" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('authority')}
              >
                <div className="flex items-center gap-2">
                  {isRead('authority') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Autoridade Interior</span>
                  <Badge variant="secondary" className="ml-2">{authority}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {authorityInfo && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">{authorityInfo.name}</h4>
                      <p className="text-muted-foreground">{authorityInfo.description}</p>
                    </div>
                    
                    <div className="bg-[#F7F3EF] p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Como Usar Sua Autoridade</h4>
                      <p className="text-muted-foreground">{authorityInfo.howToUse}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">Dicas Práticas</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {authorityInfo.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Avançado */}
        <TabsContent value="advanced" className="mt-4">
          <Accordion type="multiple" className="space-y-2">
            {/* Perfil */}
            <AccordionItem value="profile" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('profile')}
              >
                <div className="flex items-center gap-2">
                  {isRead('profile') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Perfil</span>
                  <Badge variant="secondary" className="ml-2">{profile}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {profileInfo ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">{profileInfo.name}</h4>
                      <p className="text-muted-foreground">{profileInfo.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-black/5 p-4 rounded-lg">
                        <h5 className="font-medium text-[#7B192B] mb-2">Consciente</h5>
                        <p className="text-sm text-muted-foreground">{profileInfo.conscious}</p>
                      </div>
                      <div className="bg-[#7B192B]/10 p-4 rounded-lg">
                        <h5 className="font-medium text-[#7B192B] mb-2">Inconsciente</h5>
                        <p className="text-sm text-muted-foreground">{profileInfo.unconscious}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Informações sobre o perfil {profile} em breve.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Definição */}
            <AccordionItem value="definition" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('definition')}
              >
                <div className="flex items-center gap-2">
                  {isRead('definition') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Definição</span>
                  <Badge variant="secondary" className="ml-2">{definition}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">{definitionInfo}</p>
                  
                  <div className="bg-[#F7F3EF] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">O que isso significa</h4>
                    <p className="text-muted-foreground">
                      Sua definição mostra como seus centros energéticos estão conectados. 
                      Isso afeta como você processa informações e interage com os outros.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Sucesso */}
        <TabsContent value="success" className="mt-4">
          <Accordion type="multiple" className="space-y-2">
            {/* Dicas de Sucesso */}
            <AccordionItem value="tips" className="bg-white border-2 border-[#BFAFB2] rounded-lg overflow-hidden">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-[#F7F3EF]"
                onClick={() => markAsRead('tips')}
              >
                <div className="flex items-center gap-2">
                  {isRead('tips') && <Check className="w-4 h-4 text-green-600" />}
                  <span>Caminho para o Sucesso</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {typeInfo && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">Desafios Comuns</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {typeInfo.challenges.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    <div className="bg-[#F7F3EF] p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Dicas para Viver Seu Design</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {typeInfo.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-[#7B192B] to-[#9B3040] text-white p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">✨ Lembre-se</h4>
                      <p>
                        Como {energyType}, sua estratégia é "{strategy}". 
                        Quando você vive de acordo com seu design, experimenta satisfação e alinhamento naturais.
                      </p>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisSections;
