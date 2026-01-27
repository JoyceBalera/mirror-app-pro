import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Check, BookOpen, Sparkles, Target } from "lucide-react";

interface AnalysisSectionsProps {
  energyType: string;
  authority: string;
  profile: string;
  definition: string;
  strategy: string;
}

// Map internal type keys to translation keys
const TYPE_KEYS: Record<string, string> = {
  'Gerador': 'Generator',
  'Generator': 'Generator',
  'Gerador Manifestante': 'Manifesting Generator',
  'Manifesting Generator': 'Manifesting Generator',
  'Projetor': 'Projector',
  'Projector': 'Projector',
  'Manifestor': 'Manifestor',
  'Manifestador': 'Manifestor',
  'Refletor': 'Reflector',
  'Reflector': 'Reflector',
};

// Map internal authority keys to translation keys
const AUTHORITY_KEYS: Record<string, string> = {
  'Emocional': 'Emotional',
  'Emotional': 'Emotional',
  'Sacral': 'Sacral',
  'Esplênica': 'Splenic',
  'Splenic': 'Splenic',
  'Ego/Coração': 'Ego',
  'Ego': 'Ego',
  'Ego/Heart': 'Ego',
  'Auto-Projetada': 'Self-Projected',
  'Self-Projected': 'Self-Projected',
  'Lunar': 'Lunar',
  'Sem Autoridade Interna': 'None',
  'None': 'None',
  'Mental/Environmental': 'None',
};

const AnalysisSections = ({ 
  energyType, 
  authority, 
  profile, 
  definition,
  strategy 
}: AnalysisSectionsProps) => {
  const { t } = useTranslation();
  const [readSections, setReadSections] = useState<string[]>([]);

  // Get translation keys
  const typeKey = TYPE_KEYS[energyType] || 'Generator';
  const authorityKey = AUTHORITY_KEYS[authority] || 'Emotional';

  // Get translated data
  const typeInfo = {
    name: t(`hdTypes.${typeKey}.name`),
    summary: t(`hdTypes.${typeKey}.summary`),
    strategy: t(`hdTypes.${typeKey}.strategy`),
    strategyDescription: t(`hdTypes.${typeKey}.strategyDescription`),
    notSelfTheme: t(`hdTypes.${typeKey}.notSelfTheme`),
    strengths: t(`hdTypes.${typeKey}.strengths`, { returnObjects: true }) as string[],
    challenges: t(`hdTypes.${typeKey}.challenges`, { returnObjects: true }) as string[],
    tips: t(`hdTypes.${typeKey}.tips`, { returnObjects: true }) as string[],
  };

  const authorityInfo = {
    name: t(`hdAuthorities.${authorityKey}.name`),
    description: t(`hdAuthorities.${authorityKey}.description`),
    howToUse: t(`hdAuthorities.${authorityKey}.howToUse`),
    tips: t(`hdAuthorities.${authorityKey}.tips`, { returnObjects: true }) as string[],
  };

  const profileInfo = profile ? {
    name: t(`hdProfiles.${profile}.name`, { defaultValue: '' }),
    description: t(`hdProfiles.${profile}.description`, { defaultValue: '' }),
    conscious: t(`hdProfiles.${profile}.conscious`, { defaultValue: '' }),
    unconscious: t(`hdProfiles.${profile}.unconscious`, { defaultValue: '' }),
  } : null;

  const definitionInfo = t(`hdDefinitions.${definition}`, { defaultValue: t('hdDefinitions.Single') });

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
          <span className="text-sm font-medium text-[#7B192B]">{t('analysisSections.readingProgress')}</span>
          <span className="text-sm text-muted-foreground">{readSections.length}/{totalSections} {t('analysisSections.sections')}</span>
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
            {t('analysisSections.foundational')}
          </TabsTrigger>
          <TabsTrigger 
            value="advanced"
            className="data-[state=active]:bg-[#7B192B] data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('analysisSections.advanced')}
          </TabsTrigger>
          <TabsTrigger 
            value="success"
            className="data-[state=active]:bg-[#7B192B] data-[state=active]:text-white"
          >
            <Target className="w-4 h-4 mr-2" />
            {t('analysisSections.success')}
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
                  <span>{t('analysisSections.introTitle')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('analysisSections.introDescription')}
                  </p>
                  <div className="bg-[#F7F3EF] p-4 rounded-lg">
                    <p className="font-medium text-[#7B192B] mb-2">{t('analysisSections.aboutYou')}</p>
                    <p>{typeInfo.summary}</p>
                  </div>
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
                  <span>{t('analysisSections.typeStrategy')}</span>
                  <Badge variant="secondary" className="ml-2">{typeInfo.name}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{t('analysisSections.yourStrategy')}: {typeInfo.strategy}</h4>
                    <p className="text-muted-foreground">{typeInfo.strategyDescription}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{t('analysisSections.notSelfTheme')}: {typeInfo.notSelfTheme}</h4>
                    <p className="text-muted-foreground">
                      {t('analysisSections.notSelfDescription', { theme: typeInfo.notSelfTheme.toLowerCase() })}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{t('analysisSections.yourStrengths')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {Array.isArray(typeInfo.strengths) && typeInfo.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
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
                  <span>{t('analysisSections.innerAuthority')}</span>
                  <Badge variant="secondary" className="ml-2">{authorityInfo.name}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{authorityInfo.name}</h4>
                    <p className="text-muted-foreground">{authorityInfo.description}</p>
                  </div>
                  
                  <div className="bg-[#F7F3EF] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('analysisSections.howToUseAuthority')}</h4>
                    <p className="text-muted-foreground">{authorityInfo.howToUse}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{t('analysisSections.practicalTips')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {Array.isArray(authorityInfo.tips) && authorityInfo.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                </div>
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
                  <span>{t('analysisSections.profileTitle')}</span>
                  <Badge variant="secondary" className="ml-2">{profile}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {profileInfo && profileInfo.name ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#7B192B] mb-2">{profileInfo.name}</h4>
                      <p className="text-muted-foreground">{profileInfo.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-black/5 p-4 rounded-lg">
                        <h5 className="font-medium text-[#7B192B] mb-2">{t('analysisSections.conscious')}</h5>
                        <p className="text-sm text-muted-foreground">{profileInfo.conscious}</p>
                      </div>
                      <div className="bg-[#7B192B]/10 p-4 rounded-lg">
                        <h5 className="font-medium text-[#7B192B] mb-2">{t('analysisSections.unconscious')}</h5>
                        <p className="text-sm text-muted-foreground">{profileInfo.unconscious}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('analysisSections.profileInfoSoon', { profile })}</p>
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
                  <span>{t('analysisSections.definitionTitle')}</span>
                  <Badge variant="secondary" className="ml-2">{definition}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">{definitionInfo}</p>
                  
                  <div className="bg-[#F7F3EF] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('analysisSections.definitionMeaning')}</h4>
                    <p className="text-muted-foreground">
                      {t('analysisSections.definitionDescription')}
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
                  <span>{t('analysisSections.pathToSuccess')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#7B192B] mb-2">{t('analysisSections.commonChallenges')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {Array.isArray(typeInfo.challenges) && typeInfo.challenges.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#F7F3EF] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('analysisSections.tipsForLiving')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {Array.isArray(typeInfo.tips) && typeInfo.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#7B192B] to-[#9B3040] text-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">✨ {t('analysisSections.remember')}</h4>
                    <p>
                      {t('analysisSections.rememberText', { type: typeInfo.name, strategy: strategy })}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisSections;