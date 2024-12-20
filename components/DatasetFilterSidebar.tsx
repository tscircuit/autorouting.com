import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const ToggleFilter = ({
  label,
  options,
}: {
  label: string
  options: string[]
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-2">{label}</h3>
      <ToggleGroup
        type="single"
        defaultValue="Any"
        className="flex rounded-md gap-0 bg-white p-1 text-xs *:text-xs *:flex-grow *:p-0 *:m-0"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="data-[state=on]:bg-gray-200 p-0"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export const DatasetFilterSidebar = () => {
  return (
    <div className="hidden md:block w-[300px] min-h-screen bg-gray-100 border-r border-r-gray-200 p-4">
      <div className="space-y-6">
        <ToggleFilter label="Difficulty" options={["Any", "Easy", "Hard"]} />

        <ToggleFilter
          label="Trace Count"
          options={["Any", "<100", "100-1k", "1k+"]}
        />

        <ToggleFilter
          label="Number of Samples"
          options={["Any", "<100", "100-1k", "1k+"]}
        />

        <ToggleFilter
          label="Board Layers"
          options={["Any", "1", "2", "4", "8"]}
        />
      </div>
    </div>
  )
}
