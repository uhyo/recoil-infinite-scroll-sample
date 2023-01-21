import { Suspense } from "react";
import "./App.css";
import { PokemonList } from "./components/PokemonList";

function App() {
  return (
    <div className="App">
      <h1>An infinite-scrolling list of Pokemons</h1>
      <Suspense fallback={null}>
        <PokemonList />
      </Suspense>
    </div>
  );
}

export default App;
