import { Vote } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ElectionClosedNotice() {
  return <Card className="mx-auto mt-8 max-w-xl p-8 text-center">
    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15"><Vote/></span>
    <h2 className="mt-4 text-xl font-semibold">Kỳ bầu chọn đã đóng</h2>
    <p className="mt-2 text-sm text-ink/60">Hiện không nhận phiếu. Vui lòng chờ thông báo tiếp theo từ ban tổ chức.</p>
  </Card>;
}
