import ardot from "/images/ardot.svg"
import Image from "next/image.js"

export default function Home() {
  return (
    <main>
      <div className="container mx-auto">
      <h1>autorouting</h1>
      <Image alt="autorouting text logo" src={ardot} />
      <p>
        Autorouting is the process of drawing wires on a printed circuit board
        in order to connect all the components (chips) of a circuit.
      </p>
      <p>
        We're releasing <a href="https://github.com/tscircuit/autorouting-datasets">open datasets and benchmarks</a> for autorouting. You should <a href="https://blog.autorouting.com">subscribe on Substack</a> to hear about big releases (expect something ~once a month)
      </p>
      </div>
    </main>
  );
}
