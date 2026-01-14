import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-dashed border-secondary bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {t("emptyState.waitingAccess")}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {t("emptyState.description")}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
