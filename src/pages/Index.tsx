import ScadToStlConverter from "@/components/ScadToStlConverter";

const Index = () => {
  return (
    <div className="container mx-auto p-4 py-8 flex flex-col items-center min-h-screen">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          OpenSCAD to STL Converter
        </h1>
        <p className="mt-3 text-md sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Paste your OpenSCAD code below to generate an STL file for 3D printing, right in your browser using WebAssembly.
        </p>
      </header>
      
      <main className="w-full max-w-3xl">
        <ScadToStlConverter />
      </main>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Your 3D App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;