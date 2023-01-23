import {
  atom,
  noWait,
  selector,
  useRecoilCallback,
  useRecoilValue,
} from "recoil";
import {
  formattedPokemonListQuery,
  Pokemon,
} from "./formattedPokemonListQuery";

const pageSize = 50;

type PokemonListState = {
  pokemons: readonly Pokemon[];
  mightHaveMore: boolean;
};

const totalItems = atom({
  key: "dataflow/pokemonList/totalItems",
  default: pageSize,
});

export const pokemonList = selector<PokemonListState>({
  key: "dataflow/pokemonList",
  get({ get }) {
    const chunks: (readonly Pokemon[])[] = [];
    const requestedItems = get(totalItems);
    let mightHaveMore = true;
    mainLoop: for (let offset = 0; offset < requestedItems; ) {
      const limit = Math.min(requestedItems - offset, pageSize);
      const pokemons = get(
        noWait(
          formattedPokemonListQuery({
            limit,
            offset,
          })
        )
      );
      switch (pokemons.state) {
        case "hasError": {
          throw pokemons.errorMaybe();
        }
        case "loading": {
          return {
            pokemons: chunks.flat(1),
            mightHaveMore: true,
          };
        }
        case "hasValue": {
          chunks.push(pokemons.contents);
          offset += pokemons.contents.length;
          if (pokemons.contents.length < limit) {
            mightHaveMore = false;
            break mainLoop;
          }
          break;
        }
      }
    }
    return {
      pokemons: chunks.flat(1),
      mightHaveMore,
    };
  },
});

export const usePokemonList = () => {
  return useRecoilValue(pokemonList);
};

export const usePaging = () => {
  const loadNextPage = useRecoilCallback(
    ({ set }) =>
      () => {
        set(totalItems, (count) => count + pageSize);
      },
    []
  );
  return {
    loadNextPage,
  };
};
