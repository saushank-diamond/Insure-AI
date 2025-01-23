import { Status } from "./ui/status";

interface CellProps {
  index: number;
  label: string;
  rating: string;
}

const Cell: React.FC<CellProps> = ({ index, label, rating }) => {
  let meterComponent: JSX.Element;

  switch (rating) {
    case "bad":
      meterComponent = (
        <Status className="dark:bg-red-700 dark:text-white" variant={"default"}>
          Bad
        </Status>
      );
      break;
    case "average":
      meterComponent = (
        <Status
          className="dark:bg-orange-800 dark:text-white"
          variant={"default"}
        >
          Average
        </Status>
      );
      break;
    case "good":
      meterComponent = (
        <Status
          className="dark:bg-yellow-600 dark:text-white "
          variant={"default"}
        >
          Good
        </Status>
      );
      break;
    case "excellent":
      meterComponent = (
        <Status
          className=" dark:bg-green-600 dark:text-white "
          variant={"default"}
        >
          Excellent
        </Status>
      );
      break;
    default:
      meterComponent = (
        <Status className="dark:bg-red-700 dark:text-white" variant={"default"}>
          Bad
        </Status>
      );
      break;
  }

  return (
    <div className="flex flex-row justify-between gap-12 items-center dark:bg-otherBlue dark:text-label py-1 text-sm">
      <div>
        {index + 1}. {label}
      </div>
      {meterComponent}
    </div>
  );
};

export default Cell;
