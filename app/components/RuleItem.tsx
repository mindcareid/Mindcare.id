import { FaCheck } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";

interface RuleItemProps {
  valid: boolean;
  label: string;
  showIcon?: boolean;
}

export default function RuleItem({
  valid,
  label,
  showIcon = true,
}: RuleItemProps) {
  return (
    <li className={`flex gap-2 ${valid ? "text-blue-600" : "text-red-500"}`}>
      {showIcon && (
        <span className="w-4 flex justify-center pt-0.5">
          {valid ? (
            <FaCheck className="text-xs" />
          ) : (
            <IoCloseOutline className="text-sm" />
          )}
        </span>
      )}

      <span className="leading-snug">{label}</span>
    </li>
  );
}
