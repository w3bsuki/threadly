export default function TestTailwindPage(): React.JSX.Element {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold text-red-500">Tailwind CSS Test Page</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          Blue Box
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          Green Box
        </div>
        <div className="bg-purple-500 text-white p-4 rounded-lg">
          Purple Box
        </div>
      </div>
      
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
      
      <div className="border-2 border-dashed border-gray-300 p-4">
        <p className="text-lg">This should have a dashed border</p>
      </div>
      
      <div className="flex space-x-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
          Tag 1
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
          Tag 2
        </span>
      </div>
    </div>
  );
}