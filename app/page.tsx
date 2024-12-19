import ardot from "/images/ardot.svg"
import Image from "next/image.js"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl px-4 py-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-6">autorouting</h1>
        <div className="flex justify-center mb-6">
          <Image alt="autorouting text logo" src={ardot} className="w-64" />
        </div>
        <p className="text-lg mb-4 text-gray-700">
          Autorouting is the process of drawing wires on a printed circuit board
          in order to connect all the components (chips) of a circuit.
        </p>
        <p className="text-lg mb-4 text-gray-700">
          We're releasing{" "}
          <a
            href="https://github.com/tscircuit/autorouting-dataset"
            className="text-blue-600 hover:underline"
          >
            open datasets and benchmarks
          </a>{" "}
          for autorouting. You should{" "}
          <a
            href="https://blog.autorouting.com"
            className="text-blue-600 hover:underline"
          >
            subscribe on Substack
          </a>{" "}
          to hear about big releases (expect something ~once a month)
        </p>
      </div>
    </main>
  )
}
