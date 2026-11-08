import { Vote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GlassChip } from "@/components/ui/glass-chip";

export default function ElectionClosedNotice() {
  return <Card className="mx-auto mt-8 max-w-xl p-8 text-center">
    <GlassChip className="mx-auto grid h-12 w-12 place-items-center rounded-full text-moss"><Vote aria-hidden="true"/></GlassChip>
    <h2 className="mt-4 text-xl font-semibold">Kỳ bầu chọn đã đóng</h2>
    <p className="mt-2 text-sm text-ink/75">Hiện không nhận phiếu. Vui lòng chờ thông báo tiếp theo từ ban tổ chức.</p>
  </Card>;
}
