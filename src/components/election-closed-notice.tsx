import { Vote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GlassChip } from "@/components/ui/glass-chip";
import { useLocale } from "@/components/locale/locale-provider";

export default function ElectionClosedNotice() {
  const { t } = useLocale();
  return <Card className="mx-auto mt-8 max-w-xl p-8 text-center">
    <GlassChip className="mx-auto grid h-12 w-12 place-items-center rounded-full text-moss"><Vote aria-hidden="true"/></GlassChip>
    <h2 className="mt-4 text-xl font-semibold">{t("electionClosed")}</h2>
    <p className="mt-2 text-sm text-ink/75">{t("electionClosedDescription")}</p>
  </Card>;
}
