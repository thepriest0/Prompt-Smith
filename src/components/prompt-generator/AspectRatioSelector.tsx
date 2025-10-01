interface AspectRatio {
  id: string;
  name: string;
  ratio: string;
}

interface AspectRatioSelectorProps {
  aspectRatios: AspectRatio[];
  selectedAspectRatio: string;
  onSelect: (ratio: string) => void;
}

export default function AspectRatioSelector({ aspectRatios, selectedAspectRatio, onSelect }: AspectRatioSelectorProps) {
  return (
    <>
      <h3 className="saas-heading-sm mb-4">Aspect Ratio</h3>
      <div className="grid grid-cols-3 gap-3">
        {aspectRatios.map((ratio) => (
          <button
            key={ratio.id}
            onClick={() => onSelect(ratio.ratio)}
            className={`p-3 rounded-lg border text-center transition-all ${
              selectedAspectRatio === ratio.ratio
                ? 'border-gray-900 dark:border-gray-300 bg-gray-50 dark:bg-gray-700'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className={`mx-auto mb-2 border-2 border-gray-400 dark:border-gray-500 ${
              ratio.id === '1:1' ? 'w-6 h-6' :
              ratio.id === '16:9' ? 'w-8 h-4' :
              ratio.id === '9:16' ? 'w-4 h-8' :
              ratio.id === '4:3' ? 'w-6 h-5' :
              ratio.id === '3:2' ? 'w-6 h-4' :
              'w-8 h-3'
            }`}></div>
            <div className="text-xs font-medium">{ratio.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{ratio.ratio}</div>
          </button>
        ))}
      </div>
    </>
  );
}
