export interface RowProps {
  name: string;
  value?: string;
}

const Row = ({ name, value }: RowProps) => {
  return (
    <div className="flex flex-row gap-2 items-center justify-between">
      <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value ?? 'Unknown'}</span>
    </div>
  );
};

export default Row;
