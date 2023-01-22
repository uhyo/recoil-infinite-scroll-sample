import {
  atom,
  noWait,
  selector,
  selectorFamily,
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

const pokemonListRec = selectorFamily<
  PokemonListState,
  {
    requestedItems: number;
    offset: number;
  }
>({
  key: "dataflow/pokemonList/pokemonListRec",
  get:
    ({ requestedItems, offset }) =>
    ({ get }): PokemonListState => {
      const limit = Math.min(requestedItems - offset, pageSize);
      const pokemons = get(
        formattedPokemonListQuery({
          limit,
          offset,
        })
      );

      if (pokemons.length < limit) {
        return {
          pokemons,
          mightHaveMore: false,
        };
      }
      if (requestedItems === offset + limit) {
        return {
          pokemons,
          mightHaveMore: true,
        };
      }
      const rest = get(
        noWait(
          pokemonListRec({
            requestedItems,
            offset: offset + limit,
          })
        )
      );
      switch (rest.state) {
        case "hasError": {
          throw rest.errorMaybe();
        }
        case "loading": {
          return {
            pokemons,
            mightHaveMore: true,
          };
        }
        case "hasValue": {
          return {
            pokemons: [...pokemons, ...rest.contents.pokemons],
            mightHaveMore: rest.contents.mightHaveMore,
          };
        }
      }
    },
});

export const pokemonList = selector<PokemonListState>({
  key: "dataflow/pokemonList",
  get({ get }) {
    return get(
      pokemonListRec({
        requestedItems: get(totalItems),
        offset: 0,
      })
    );
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
